// Copyright (c) 2013 Chananya Freiman (aka GhostWolf)

var SHADERS = {
	"vsbonetexture":"uniform sampler2D u_bones;uniform float u_bone_size;uniform float u_pixel_size;mat4 A(float a){return mat4(texture2D(u_bones,vec2(a*u_bone_size,0)),texture2D(u_bones,vec2(a*u_bone_size+u_pixel_size,0)),texture2D(u_bones,vec2(a*u_bone_size+u_pixel_size*2.,0)),texture2D(u_bones,vec2(a*u_bone_size+u_pixel_size*3.,0)));}",
	"vsworld":"uniform mat4 u_mvp;uniform vec2 u_uv_offset;attribute vec3 a_position;attribute vec2 a_uv;varying vec2 N;void main(){N=a_uv+u_uv_offset;gl_Position=u_mvp*vec4(a_position,1);}",
	"vswhite":"uniform mat4 u_mvp;attribute vec3 a_position;void main(){gl_Position=u_mvp*vec4(a_position,1);}",
	"psworld":"uniform sampler2D u_texture;uniform float u_a;varying vec2 N;void main(){gl_FragColor=vec4(texture2D(u_texture,N).rgb,u_a);}",
	"pswhite":"void main(){gl_FragColor=vec4(1);}",
	"wvssoftskinning":"uniform mat4 u_mvp;uniform vec2 u_uv_offset;attribute vec3 a_position;attribute vec2 a_uv;varying vec2 N;void main(){N=a_uv+u_uv_offset;gl_Position=u_mvp*vec4(a_position,1);}",
	"wvshardskinningarray":"uniform mat4 u_mvp;uniform mat4 u_bones[62];uniform vec2 u_uv_offset;attribute vec3 a_position;attribute vec2 a_uv;attribute vec4 a_bones;attribute float a_bone_number;varying vec2 N;void main(){vec4 a=vec4(0);vec4 b=vec4(a_position,1);a+=u_bones[int(a_bones[0])]*b;a+=u_bones[int(a_bones[1])]*b;a+=u_bones[int(a_bones[2])]*b;a+=u_bones[int(a_bones[3])]*b;a/=a_bone_number;N=a_uv+u_uv_offset;gl_Position=u_mvp*a;}",
	"wvshardskinningtexture":"uniform mat4 u_mvp;uniform vec2 u_uv_offset;attribute vec3 a_position;attribute vec2 a_uv;attribute vec4 a_bones;attribute float a_bone_number;varying vec2 N;void main(){vec4 a=vec4(0);vec4 b=vec4(a_position,1);a+=A(a_bones[0])*b;a+=A(a_bones[1])*b;a+=A(a_bones[2])*b;a+=A(a_bones[3])*b;a/=a_bone_number;N=a_uv+u_uv_offset;gl_Position=u_mvp*a;}",
	"wvsparticles":"uniform mat4 u_mvp;attribute vec3 a_position;attribute vec2 a_uv;attribute vec4 a_color;varying vec2 N;varying vec4 O;void main(){N=a_uv;O=a_color;gl_Position=u_mvp*vec4(a_position,1);}",
	"wpsmain":"uniform sampler2D u_texture;uniform bvec3 u_type;uniform vec4 u_modifier;varying vec3 P;varying vec2 N;void main(){vec4 a=texture2D(u_texture,N);if(u_type[0]&&a.a<.7){discard;}if(u_type[1]&&a.r<.2&&a.g<.2&&a.b<.2){discard;}if(u_type[2]&&a.r>.9&&a.g>.9&&a.b>.9){discard;}gl_FragColor=a*u_modifier;}",
	"wpsparticles":"uniform sampler2D u_texture;varying vec2 N;varying vec4 O;void main(){gl_FragColor=texture2D(u_texture,N)*O;}",
	"svscommon":"vec3 C(vec3 d,vec3 c,vec3 a,vec3 b){vec3 e;e.x=dot(d,c);e.y=dot(d,a);e.z=dot(d,b);return e;}",
	"svsstandard":"uniform mat4 u_mvp;uniform mat4 u_mv;uniform vec3 u_eyePos;uniform vec3 u_lightPos;attribute vec3 a_position;attribute vec4 a_normal;attribute vec2 a_uv0;\n#ifdef EXPLICITUV1\nattribute vec2 a_uv1;\n#endif\n#ifdef EXPLICITUV2\nattribute vec2 a_uv1;attribute vec2 a_uv2\n#endif\n#ifdef EXPLICITUV3\nattribute vec2 a_uv1;attribute vec2 a_uv2attribute vec2 a_uv3\n#endif\nattribute vec4 a_tangent;attribute vec4 a_bones;attribute vec4 a_weights;varying vec3 P;varying vec2 N[4];varying vec3 Q;varying vec3 R;varying vec3 S;void D(vec3 c,vec3 b,vec3 d,vec4 a,vec4 h,out vec3 f,out vec3 e,out vec3 g){vec4 j=vec4(c,1);vec4 i=vec4(b,0);vec4 k=vec4(d,0);vec4 l;mat4 m=A(a[0])*h[0];mat4 n=A(a[1])*h[1];mat4 o=A(a[2])*h[2];mat4 p=A(a[3])*h[3];l=vec4(0);l+=m*j;l+=n*j;l+=o*j;l+=p*j;f=vec3(l);l=vec4(0);l+=m*i;l+=n*i;l+=o*i;l+=p*i;e=normalize(vec3(l));l=vec4(0);l+=m*k;l+=n*k;l+=o*k;l+=p*k;g=normalize(vec3(l));}void main(){vec3 h,g,k;D(a_position,vec3(a_normal),vec3(a_tangent),a_bones,a_weights,h,g,k);mat3 e=mat3(u_mv);vec3 i=(u_mv*vec4(h,1)).xyz;vec3 f=normalize(e*g);vec3 j=normalize(e*k);vec3 a=normalize(cross(f,j)*a_normal.w);vec3 d=normalize(u_lightPos-i);Q=normalize(C(d,j,a,f));vec3 b=normalize(u_eyePos-i);vec3 c=normalize(b-u_lightPos);R=C(b,j,a,f);S=C(c,j,a,f);P=f;N[0]=a_uv0;\n#ifdef EXPLICITUV1\nN[1]=a_uv1;\n#endif\n#ifdef EXPLICITUV2\nN[1]=a_uv1;N[2]=a_uv2;\n#endif\n#ifdef EXPLICITUV3\nN[1]=a_uv1;N[2]=a_uv2;N[3]=a_uv3;\n#endif\ngl_Position=u_mvp*vec4(h,1);}",
	"spscommon":"uniform vec3 u_teamColor;varying vec3 P;varying vec2 N[4];varying vec3 Q;varying vec3 R;varying vec3 S;struct M{bool enabled;float op;float channels;float teamColorMode;vec3 multAddAlpha;bool useAlphaFactor;bool invert;bool multColor;bool addColor;bool clampResult;bool useConstantColor;vec4 constantColor;float uvSource;float uvCoordinate;float fresnelMode;float fresnelTransformMode;mat4 fresnelTransform;bool fresnelClamp;vec3 fresnelExponentBiasScale;};float E(vec3 f,vec3 b,float a,mat4 d,float e,bool c){vec3 g=b;float h;if(e!=.0){g=(d*vec4(g,1.)).xyz;if(e==2.){g=normalize(g);}}if(c){h=1.-clamp(-dot(f,g),.0,1.);}else{h=1.-abs(dot(f,g));}h=max(h,.0000001);return pow(h,a);}vec3 F(vec4 a,vec3 c,M b){if(b.op==.0){c*=a.rgb;}else if(b.op==1.){c*=a.rgb*2.;}else if(b.op==2.){c+=a.rgb*a.a;}else if(b.op==6.){c+=a.rgb;}else if(b.op==3.){c=mix(c,a.rgb,a.a);}else if(b.op==4.){c+=a.a*u_teamColor;}else if(b.op==5.){c+=a.a*u_teamColor;}return c;}vec4 G(float a,vec4 b){if(a==3.){b=b.rrrr;}else if(a==4.){b=b.gggg;}else if(a==5.){b=b.bbbb;}else if(a==2.){b=b.aaaa;}else if(a==.0){b.a=1.;}return b;}vec2 H(M a){if(a.uvCoordinate==1.){return N[1];}else if(a.uvCoordinate==2.){return N[2];}else if(a.uvCoordinate==3.){return N[3];}return N[0];}vec4 I(sampler2D a,M b){if(b.useConstantColor&&false){return b.constantColor;}return texture2D(a,H(b));}vec4 J(sampler2D a,M b){vec4 e=I(a,b);vec4 d=G(b.channels,e);if(b.useAlphaFactor&&false){d.a*=b.multAddAlpha.z;}if(b.teamColorMode==1.){d=vec4(mix(u_teamColor,d.rgb,e.a),1);}else if(b.teamColorMode==2.){d=vec4(mix(u_teamColor,d.rgb,e.a),1);}if(b.invert){d=vec4(1)-d;}if(b.multColor&&false){d*=b.multAddAlpha.x;}if(b.addColor&&false){d+=b.multAddAlpha.y;}if(b.clampResult){d=clamp(d,.0,1.);}if(b.fresnelMode!=.0){float c=E(P,R,b.fresnelExponentBiasScale.x,b.fresnelTransform,b.fresnelTransformMode,b.fresnelClamp);if(b.fresnelMode==2.){c=1.-c;}c=clamp(c*b.fresnelExponentBiasScale.z+b.fresnelExponentBiasScale.y,.0,1.);d*=c;}return d;}vec3 K(sampler2D a){vec4 c=texture2D(a,N[0]);vec3 b;b.xy=2.*c.wy-1.;b.z=sqrt(max(.0,1.-dot(b.xy,b.xy)));return b;}vec4 L(sampler2D d,M a,float e,float c,vec3 b){vec4 f;if(a.enabled){f=J(d,a);}else{f=vec4(0);}float g=pow(max(-dot(S,b),.0),e)*c;return f*g;}",
	"spsstandard":"uniform float u_specularity;uniform float u_specMult;uniform float u_emisMult;uniform vec4 u_lightAmbient;uniform M u_diffuseLayerSettings;uniform sampler2D u_diffuseMap;uniform M u_decalLayerSettings;uniform sampler2D u_decalMap;uniform M u_specularLayerSettings;uniform sampler2D u_specularMap;uniform M u_glossLayerSettings;uniform sampler2D u_glossMap;uniform M u_emissiveLayerSettings;uniform sampler2D u_emissiveMap;uniform M u_emissive2LayerSettings;uniform sampler2D u_emissive2Map;uniform M u_evioLayerSettings;uniform sampler2D u_evioMap;uniform M u_evioMaskLayerSettings;uniform sampler2D u_evioMaskMap;uniform M u_alphaLayerSettings;uniform sampler2D u_alphaMap;uniform M u_alphaMaskLayerSettings;uniform sampler2D u_alphaMaskMap;uniform M u_normalLayerSettings;uniform sampler2D u_normalMap;uniform M u_heightLayerSettings;uniform sampler2D u_heightMap;uniform M u_lightMapLayerSettings;uniform sampler2D u_lightMapMap;uniform M u_aoLayerSettings;uniform sampler2D u_aoMap;void main(){vec3 b;vec4 f=u_lightAmbient;vec3 j;vec3 i;if(u_normalLayerSettings.enabled){j=K(u_normalMap);}else{j=P;}float g=max(dot(j,Q),.0);if(g>.0){if(u_diffuseLayerSettings.enabled){vec4 d=J(u_diffuseMap,u_diffuseLayerSettings);b=F(d,b,u_diffuseLayerSettings);}if(u_decalLayerSettings.enabled){vec4 c=J(u_decalMap,u_decalLayerSettings);b=F(c,b,u_decalLayerSettings);}vec4 k=L(u_specularMap,u_specularLayerSettings,u_specularity,u_specMult,j);if(u_lightMapLayerSettings.enabled){vec4 h=J(u_lightMapMap,u_lightMapLayerSettings)*2.;i=h.rgb;}/*f.rgb=b*i+k.rgb;*/f.rgb=(b+k.rgb)*g;bool a=false;vec3 e;vec4 l;if(u_emissiveLayerSettings.enabled){l=J(u_emissiveMap,u_emissiveLayerSettings);if(u_emissiveLayerSettings.op==.0||u_emissiveLayerSettings.op==1.||u_emissiveLayerSettings.op==3.){f.rgb=F(l,f.rgb,u_emissiveLayerSettings);}else{e=F(l,e,u_emissiveLayerSettings);a=true;}}if(u_emissive2LayerSettings.enabled){l=J(u_emissive2Map,u_emissive2LayerSettings);if(!a&&(u_emissive2LayerSettings.op==.0||u_emissive2LayerSettings.op==1.||u_emissive2LayerSettings.op==3.)){f.rgb=F(l,f.rgb,u_emissive2LayerSettings);}else{e=F(l,e,u_emissive2LayerSettings);a=true;}}if(a){f.rgb+=e*u_emisMult;}}gl_FragColor=f;}",
	"spsspecialized":"#ifdef DIFFUSE_PASS\nuniform M u_diffuseLayerSettings;uniform sampler2D u_diffuseMap;\n#endif\n#ifdef SPECULAR_PASS\nuniform M u_specularLayerSettings;uniform sampler2D u_specularMap;uniform float u_specularity;uniform float u_specMult;\n#endif\n#ifdef HIGHRES_NORMALS\nuniform M u_normalLayerSettings;uniform sampler2D u_normalMap;\n#endif\n#ifdef EMISSIVE_PASS\nuniform M u_emissiveLayerSettings;uniform sampler2D u_emissiveMap;uniform M u_emissive2LayerSettings;uniform sampler2D u_emissive2Map;uniform float u_emisMult;\n#endif\n#ifdef DECAL_PASS\nuniform M u_decalLayerSettings;uniform sampler2D u_decalMap;\n#endif\nvoid main(){vec4 b=vec4(0);vec3 f;\n#ifdef HIGHRES_NORMALS\nf=K(u_normalMap);\n#else\nf=P;\n#endif\n#ifdef DIFFUSE_PASS\nb=J(u_diffuseMap,u_diffuseLayerSettings);\n#endif\n#ifdef NORMALS_PASS\nb=vec4(f,1);\n#endif\n#ifdef SPECULAR_PASS\nb=L(u_specularMap,u_specularLayerSettings,u_specularity,u_specMult,f);\n#endif\n#ifdef EMISSIVE_PASS\nbool a=false;vec3 d=vec3(0);vec4 g;if(u_emissiveLayerSettings.enabled){g=J(u_emissiveMap,u_emissiveLayerSettings);if(u_emissiveLayerSettings.op==.0||u_emissiveLayerSettings.op==1.||u_emissiveLayerSettings.op==3.){b.rgb=F(g,b.rgb,u_emissiveLayerSettings);}else{d=F(g,d,u_emissiveLayerSettings);a=true;}}if(u_emissive2LayerSettings.enabled){g=J(u_emissive2Map,u_emissive2LayerSettings);if(!a&&(u_emissive2LayerSettings.op==.0||u_emissive2LayerSettings.op==1.||u_emissive2LayerSettings.op==3.)){b.rgb=F(g,b.rgb,u_emissive2LayerSettings);}else{d=F(g,d,u_emissive2LayerSettings);a=true;}}if(a){b.rgb+=d.rgb*u_emisMult;}\n#endif\n#ifdef UNSHADED_PASS\nfloat e=max(dot(f,Q),.0);b=vec4(e,e,e,1);\n#endif\n#ifdef DECAL_PASS\nif(u_decalLayerSettings.enabled){vec4 c=J(u_decalMap,u_decalLayerSettings);b.rgb=F(c,b.rgb,u_decalLayerSettings);b.a=1.;}\n#endif\ngl_FragColor=b;}"
};