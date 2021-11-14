//https://www.shadertoy.com/view/fl3GDl
#define PI 3.1415926535897932384626433832795
#define STATIC
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec2[6] centers = vec2[](
                  vec2(0.5,0.5),
                  vec2(0.1,0.3),
                  vec2(0.3,0.1),
                  vec2(0.4,0.15),
                  vec2(0.9,0.2),
                  vec2(0.2,0.2)
);
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    uv.x *= iResolution.x/iResolution.y;
    float xMultiplier = iResolution.x/iResolution.y;
    vec2 mouse = iMouse.xy/iResolution.xy;
    mouse.x *= iResolution.x/iResolution.y;


    float staticMovPeriod = 20.0;
    float staticIntensity = 0.1;
    float disRadius = 0.03;
    float ringSize = 0.1;
    float reach = 2.0;
    int ringNum = 3;
    float timeBetweenTwoRings = 3.0;
    float mixValue = 0.05;
    vec3 finalColor = vec3(170,213,219)/255.0;
    float spd = .3;


https://www.shadertoy.com/view/fl3GDl
  vec3 bgTex;
  vec2 center = vec2(0.5*xMultiplier,0.5);
  float minRadius = 0.0;
  float maxRadius = 0.0;


  vec2 staticDistortion = vec2(sin(iTime*2.0*PI/staticMovPeriod));
  staticDistortion.x *= xMultiplier;


  //center = mouse;
  #ifdef STATIC
  float disPower = staticIntensity*exp(-distance(uv, staticDistortion));
  uv +=disPower;
  #endif



  for (int i = 0; i<6; i++)
  {
            float offset = 0.0;
            center = centers[i];
            center.x *=xMultiplier;
            float j = float(i)/(timeBetweenTwoRings);
            if (abs(reach*sin(spd*iTime+j+offset))-abs(reach*sin(spd*(iTime-iTimeDelta)+offset+j))>0.0){
              minRadius = abs(reach*sin(spd*iTime+  j+offset));  //j is time offset
              }
              else {
              minRadius = 0.0;
              offset = float(offset == 0.0)*(PI/4.0);
              }
              maxRadius = (minRadius + ringSize)*(float(minRadius !=0.0));


        float dis = distance(uv,center);
        float current =dis - minRadius; //Doing polynomial interpolation
        float diff = maxRadius - minRadius;
        float middle = diff/2.0;
        float factor = disRadius/(middle*(middle-diff));
        vec2 direction = (uv-center)/abs(uv-center);
        direction = vec2(1.0,1.0);
        uv += direction.x * max(0.0,factor*current*(current-diff))/max(1.0,dis*2.0);
        if (dis> minRadius && 
            dis< maxRadius)
        {
            mixValue = 0.0;
        }
  };
  bgTex = textureLod(iChannel0, uv, 1.0).xyz;
  //bgTex = mix(bgTex, texture(iChannel1, uv).xyz, 0.5);
  fragColor = vec4(mix(bgTex,finalColor,mixValue),1.0);
}
