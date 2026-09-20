import { BufferGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TubeGeometry, CatmullRomCurve3, Vector3, InstancedMesh, Object3D, Color, PlaneGeometry, ShaderMaterial, Float32BufferAttribute, DoubleSide } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';


/** A curved, pointed vane, shared by all contour feathers (no image textures). */
function plumageGeometry() {
  const p:number[]=[], uv:number[]=[], ix:number[]=[];
  for(let i=0;i<=12;i++) for(let j=0;j<=6;j++) {
    const t=i/12, u=j/3-1;
    const w=Math.pow(Math.sin(Math.PI*t),.8)*(1-.38*t);
    p.push(u*w,1-2*t,.18*(1-u*u)*Math.sin(Math.PI*t)+.12*t*t);
    uv.push(j/6,t);
    if(i<12&&j<6){const a=i*7+j;ix.push(a,a+7,a+1,a+1,a+7,a+8);}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function featherSurface(color:string) {
  const m=new MeshStandardMaterial({color,metalness:.28,roughness:.68,side:DoubleSide});
  m.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 featherUv;').replace('#include <uv_vertex>','#include <uv_vertex>\nfeatherUv=uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 featherUv;').replace('#include <color_fragment>',`#include <color_fragment>
      float x=abs(featherUv.x-.5)*2.;
      float phase=(featherUv.y-x*.23)*115.;
      float line=.5+.5*sin(phase);
      float filterWidth=fwidth(phase);
      line=mix(line,.5,smoothstep(1.,3.,filterWidth));
      float rachis=1.-smoothstep(.012,.045,x);
      diffuseColor.rgb*=.57+.38*line+.14*rachis;
      diffuseColor.rgb*=1.-.16*smoothstep(.72,1.,x);
    `);
  };return m;
}

/** Entirely geometric sculpture: shared plumage instances over continuous anatomy. */
export function createHero() {
  const root = new Group();
  const neckPivot = new Group(); neckPivot.position.set(0,1.5,.62); root.add(neckPivot);
  const neckSpace = new Group(); neckSpace.position.set(0,-1.5,-.62); neckPivot.add(neckSpace);
  const headPivot = new Group(); headPivot.position.set(0,3.02,.78); neckSpace.add(headPivot);
  const headSpace = new Group(); headSpace.position.set(0,-3.02,-.78); headPivot.add(headSpace);
  const eyes: Mesh[] = [];
  root.userData.neckPivot=neckPivot;root.userData.headPivot=headPivot;root.userData.eyes=eyes;
  const sphere = new SphereGeometry(1, 32, 24);
  const blue = new MeshStandardMaterial({color:'#06466f',metalness:.28,roughness:.72});
  const bronze = new MeshStandardMaterial({ color: '#655540', metalness: .28, roughness: .7 });
  const dark = new MeshStandardMaterial({ color: '#07161e', metalness: .12, roughness: .65 });
  const ivory = new MeshStandardMaterial({ color: '#b6b5a4', metalness: .06, roughness: .72 });
  const batches = new Map<MeshStandardMaterial, BufferGeometry[]>();
  const dummy = new Object3D();
  function ellipsoid(material: MeshStandardMaterial, p: number[], s: number[], rotation = 0, isEye = false) {
    dummy.position.set(p[0], p[1], p[2]); dummy.scale.set(s[0], s[1], s[2]); dummy.rotation.set(0, 0, rotation); dummy.updateMatrix();
    if(isEye) {
      const eye=new Mesh(sphere,material);eye.position.copy(dummy.position);eye.scale.copy(dummy.scale);
      eye.userData.height=s[1];headSpace.add(eye);eyes.push(eye);return;
    }
    const geo = sphere.clone().applyMatrix4(dummy.matrix);
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material)!.push(geo);
  }
  function tube(material: MeshStandardMaterial, points: number[][], radius: number) {
    const geo = new TubeGeometry(new CatmullRomCurve3(points.map(p => new Vector3(...p as [number, number, number]))), 20, radius, 7, false);
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material)!.push(geo);
  }
  // One continuous anatomical profile through breast, shoulder and S-curved neck.
  // x = lateral radius, y = height, z = depth radius; centerline is separate.
  const profile=new CatmullRomCurve3([
    new Vector3(.18,.50,.30),new Vector3(.37,.78,.59),new Vector3(.48,1.18,.76),
    new Vector3(.43,1.50,.61),new Vector3(.30,1.82,.38),new Vector3(.215,2.14,.235),
    new Vector3(.16,2.52,.17),new Vector3(.142,2.90,.15),new Vector3(.145,3.12,.17)
  ]);
  const centers=new CatmullRomCurve3([new Vector3(0,.5,.25),new Vector3(0,1.18,.27),new Vector3(0,1.5,.34),new Vector3(0,1.82,.49),new Vector3(0,2.14,.61),new Vector3(0,2.52,.62),new Vector3(0,2.9,.73),new Vector3(0,3.12,.81)]);
  function surface(t:number,a:number) {
    const r=profile.getPoint(t);
    // Find centerline at the same height (the curves have different knot spacing).
    let lo=0,hi=1;for(let j=0;j<16;j++){const m=(lo+hi)/2;if(centers.getPoint(m).y<r.y)lo=m;else hi=m;}
    const z=centers.getPoint((lo+hi)/2).z;
    return new Vector3(Math.sin(a)*r.x,r.y,z+Math.cos(a)*r.z);
  }
  function surfaceNormal(t:number,a:number) {
    const along=surface(Math.min(1,t+.001),a).sub(surface(Math.max(0,t-.001),a));
    const across=surface(t,a+.001).sub(surface(t,a-.001));
    return across.cross(along).normalize();
  }
  function skin(start:number,end:number,parent:Group) {
    const p:number[]=[],uv:number[]=[],ix:number[]=[];
    for(let i=0;i<=64;i++)for(let j=0;j<=40;j++){
      p.push(...surface(start+(end-start)*i/64,j/40*Math.PI*2).toArray());uv.push(j/40,i/64);
      if(i<64&&j<40){const k=i*41+j;ix.push(k,k+1,k+41,k+1,k+42,k+41);}
    }
    const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();parent.add(new Mesh(g,blue));
  }
  skin(0,.41,root);skin(.34,1,neckSpace);
  ellipsoid(blue,[0,3.13,.81],[.176,.183,.282]);

  for(const side of [-1,1]) {
    ellipsoid(dark,[side*.43,1.18,.15],[.16,.57,.58],side*-.10);
    // Two narrow pale markings frame a small dark eye; no large cartoon eye patch.
    function marking(points:number[][],width:number) {
      const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p as [number,number,number]))),p:number[]=[],uv:number[]=[],idx:number[]=[];
      for(let i=0;i<=20;i++) {const t=i/20,c=curve.getPoint(t),v=curve.getTangent(t),w=width*Math.pow(Math.sin(Math.PI*t),.55);
        for(const sign of [-1,1]){p.push(c.x,c.y+sign*v.z*w,c.z-sign*v.y*w);uv.push(sign*.5+.5,t);}
        if(i<20){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}
      }
      const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
      const m=ivory.clone();m.side=DoubleSide;headSpace.add(new Mesh(g,m));
    }
    marking([[side*.140,3.225,.82],[side*.168,3.205,.91],[side*.147,3.175,.98],[side*.115,3.12,1.05]],.014);
    marking([[side*.154,3.16,.72],[side*.177,3.075,.81],[side*.166,3.06,.91],[side*.12,3.085,1.015]],.021);
    ellipsoid(dark,[side*.156,3.143,.942],[.013,.030,.036]);
    ellipsoid(dark,[side*.170,3.145,.948],[.009,.021,.025],0,true);
    ellipsoid(ivory,[side*.178,3.154,.96],[.003,.004,.005],0,true);
    tube(bronze,[[side*.23,.68,.35],[side*.25,.35,.25],[side*.25,.075,.38]],.038);
    for(let toe=-1;toe<=1;toe++) {
      const end=[side*.25+toe*.17,.025,.81-Math.abs(toe)*.12];
      tube(bronze,[[side*.25,.07,.38],[side*.25+toe*.09,.035,.61],end],.023);
      ellipsoid(ivory,[end[0],.025,end[2]+.02],[.023,.018,.055]);
    }
    tube(bronze,[[side*.25,.07,.38],[side*.3,.035,.2],[side*.34,.026,.1]],.023);
  }
  // Horn bill: broad root, sharp culmen and a subtly downturned point.
  const billP:number[]=[],billUV:number[]=[],billI:number[]=[];
  const rings=[[3.082,1.065,.082,.060],[3.063,1.16,.057,.043],[3.012,1.275,.029,.024],[2.953,1.335,.001,.001]];
  rings.forEach(([y,z,w,h],i)=>{for(let j=0;j<8;j++){const a=j/8*Math.PI*2;billP.push(Math.sin(a)*w,y+Math.cos(a)*h,z);billUV.push(j/8,i/3);if(i<3){const k=i*8+j,n=i*8+(j+1)%8;billI.push(k,n,k+8,n,n+8,k+8);}}});
  const bill=new BufferGeometry();bill.setAttribute('position',new Float32BufferAttribute(billP,3));bill.setAttribute('uv',new Float32BufferAttribute(billUV,2));bill.setIndex(billI);bill.computeVertexNormals();headSpace.add(new Mesh(bill,ivory));
  for(const side of [-1,1]) {
    tube(dark,[[side*.074,3.063,1.087],[side*.044,3.036,1.20],[side*.012,2.980,1.31]],.003);
    ellipsoid(dark,[side*.061,3.09,1.137],[.009,.010,.025]);
  }
  const plume=plumageGeometry(), plumage=featherSurface('#ffffff');
  for(let i=0;i<13;i++) {
    const a=(i-6)*.092, x=Math.sin(a)*.47, y=3.77-Math.abs(a)*.13,z=.68-Math.cos(a)*.07;
    tube(bronze,[[0,3.275,.72],[x*.48,3.51,.66],[x,y,z]],.0035);
    const tip=new Mesh(plume,blue);tip.position.set(x,y+.035,z);tip.scale.set(.023,.060,.025);tip.rotation.z=-a;headSpace.add(tip);
    // Open fine barbs, supported by a very small pointed crest vane.
    for(let j=0;j<5;j++) for(const side of [-1,1]) tube(blue,[[x,y-.015+j*.016,z],[x+side*.035,y+.009+j*.016,z+.008]],.0018);
  }
  for(const [mat,geos] of batches) {
    const head:BufferGeometry[]=[],body:BufferGeometry[]=[];
    for(const geo of geos) {geo.computeBoundingBox();(geo.boundingBox!.min.y>2.8?head:body).push(geo);}
    if(body.length) root.add(new Mesh(mergeGeometries(body),mat));
    if(head.length) headSpace.add(new Mesh(mergeGeometries(head),mat));
    geos.forEach(g=>g.dispose());
  }
  // Fine contour plumage follows anatomical surface frames, overlapping downward.
  const bodyFeathers=new InstancedMesh(plume,plumage,43*40);
  const neckFeathers=new InstancedMesh(plume,plumage,70*28);
  function place(mesh:InstancedMesh,i:number,p:Vector3,normal:Vector3,w:number,h:number,color:Color,roll=0) {
    dummy.position.copy(p);dummy.quaternion.setFromUnitVectors(new Vector3(0,0,1),normal.normalize());dummy.rotateZ(roll);
    dummy.scale.set(w,h,.020);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color);
  }
  const c=new Color();let n=0;
  for(let row=0;row<43;row++) for(let j=0;j<40;j++) {
    const t=.01+row/42*.385,a=(j+(row%2)*.5)/40*Math.PI*2;
    c.setHSL(.58+.009*Math.sin(j*5+row),.84,.165+.004*Math.sin(row*7+j*3));
    place(bodyFeathers,n++,surface(t,a),surfaceNormal(t,a),.039,.054,c);
  }
  n=0;
  for(let row=0;row<70;row++) for(let j=0;j<28;j++) {
    const t=.375+row/69*.625,a=(j+(row%2)*.5)/28*Math.PI*2,r=profile.getPoint(t).x;
    c.setHSL(.578+.016*Math.sin(a),.86,.167+.004*Math.sin(row*5+j*7));
    place(neckFeathers,n++,surface(t,a),surfaceNormal(t,a),.012+r*.105,.037,c);
  }
  root.add(bodyFeathers);neckSpace.add(neckFeathers);root.userData.breastScales=bodyFeathers;
  // Tiny crown feathers break up the smooth head; cheek region stays clear for markings.
  const crown=new InstancedMesh(plume,plumage,26*30);n=0;
  for(let row=0;row<26;row++) for(let j=0;j<30;j++) {
    const v=-.90+row/25*1.86,a=(j+(row%2)*.5)/30*Math.PI*2,r=Math.sqrt(1-v*v);
    const p=new Vector3(Math.sin(a)*.178*r,3.13+v*.184,.81+Math.cos(a)*.284*r);
    if(p.y<3.225&&p.z>.72&&Math.abs(p.x)>.095)continue;
    c.setHSL(.574+.012*Math.sin(j),.86,.18);
    place(crown,n++,p,new Vector3(Math.sin(a)*r/.176,v/.183,Math.cos(a)*r/.282),.013,.019,c);
  }crown.count=n;headSpace.add(crown);
  // Flight feathers and coverts wrap each wing's ellipsoidal surface instead of hiding inside it.
  const wings=new InstancedMesh(plume,plumage,2*8*18);n=0;
  for(const side of [-1,1]) for(let row=0;row<8;row++) for(let j=0;j<18;j++) {
    const y=.73+row*.12,a=-1.05+j/17*2.1,v=(y-1.18)/.64,r=Math.sqrt(Math.max(.01,1-v*v));
    const p=new Vector3(side*(.43+.215*r*Math.cos(a)),y,.15+.645*r*Math.sin(a));
    c.set(row>4?(j%3===0?'#7c765b':'#5e6652'):'#283f43');
    place(wings,n++,p,new Vector3(side*Math.cos(a),v*.35,Math.sin(a)*.5),.060,row>4?.13:.24,c,side*-.27);
  }root.add(wings);
  // Pointed green/gold shoulder coverts retain their original reversible attachment.
  const coverts = new InstancedMesh(plume,plumage,2*9*18);let k=0;
  for(const side of [-1,1]) for(let row=0;row<9;row++) for(let j=0;j<18;j++) {
    const a=side*(.25+j/17*1.2),len=.49+row*.135;
    const p=new Vector3(Math.sin(a)*len,Math.cos(a)*len,.22-row*.058);
    c.setHSL(.34+.06*Math.sin(row*2+j*.6),.48,.16+.017*Math.sin(row+j*3));
    place(coverts,k++,p,new Vector3(Math.sin(a)*.20,.10,1),.066,.18,c,-a+Math.PI);
  }
  coverts.position.set(0,1.37,.45);root.add(coverts);root.userData.coverts=coverts;
  // A horizonless ground pool with an analytic soft contact shadow. No second fan pass.
  const floor = new Mesh(new PlaneGeometry(200,200), new ShaderMaterial({
    transparent:true, depthWrite:false,
    vertexShader:'varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 p; void main(){float pool=exp(-dot(p.xy/vec2(7.,5.),p.xy/vec2(7.,5.))); float contact=exp(-dot((p.xy-vec2(0.,-.3))/vec2(.85,.9),(p.xy-vec2(0.,-.3))/vec2(.85,.9))); vec3 col=mix(vec3(.013,.023,.026),vec3(.0005,.001,.002),contact); gl_FragColor=vec4(col,pool*.72); #include <colorspace_fragment> }`.replace('#include <colorspace_fragment>', '\n#include <colorspace_fragment>\n'),
  })); floor.rotation.x=-Math.PI/2;floor.position.y=-.005;root.add(floor);
  return root;
}
