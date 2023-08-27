//https://www.shadertoy.com/view/csffD7

//Common------------------------

#define OCEAN_LEVEL 0.5
#define OCEAN_EDGE 0.05
#define MOUNTAIN_LEVEL   0.8
#define MOUNTAIN_LEVEL_2 0.95

#define OCEAN_COLOR    vec3(0.0, 1.0, 1.0)
#define PLAIN_COLOR    vec3(0.03, 0.35,0.06)
#define MOUNTAIN_COLOR vec3(0.8)

#define PI 3.14159265359
float rand(in vec2 uv) {
    return fract(sin(dot(uv,  vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(in vec2 pos) {
    vec2 localPos = fract(pos);
    float a        = rand(floor(pos));
    float b        = rand(floor(pos + vec2(1.0, 0.0)));
    float c        = rand(floor(pos + vec2(1.0, 1.0)));
    float d        = rand(floor(pos + vec2(0.0, 1.0)));
    
    vec2 xy = localPos*localPos*(3.0 - 2.0*localPos);
    
    return mix(mix(a, b, xy.x), mix(d, c, xy.x), xy.y);
    
}

float fbm(in vec2 pos) {
   float ret  = 0.0;
   float freq = 1.0;
   
   ret += noise(pos);
   ret += 0.5     * noise(2.0   * pos);
   ret += 0.25    * noise(4.0   * pos);
   ret += 0.125   * noise(8.0   * pos);
   ret += 0.0625  * noise(16.0  * pos);
   ret += 0.03125 * noise(32.0  * pos);
   
   return ret;
}


//BufferA------------------------

//Generates the map and writes it in bufferA


float getHeight(in vec2 uv) {
    float temp      = fbm(vec2(fbm(vec2(fbm(uv*10.0), fbm(uv*5.0))), fbm(uv * 15.0)));
    temp           *= temp * temp;
    return temp * 0.47;
}

float worldEdge(in vec2 uv, float worldHeight, float edgeHeight, in vec2 downLeft) {
    float temp;
    temp = mix(worldHeight, edgeHeight, clamp( (uv.x - 1.0 + downLeft.x ) / downLeft.x ,0.0, 1.0));    
    temp = mix(temp, edgeHeight, clamp( (uv.y - 1.0 + downLeft.y) /downLeft.y ,0.0, 1.0)); 
    temp = mix(temp, edgeHeight, clamp( (downLeft.x - uv.x)     / downLeft.x ,0.0, 1.0)); 
    temp = mix(temp, edgeHeight, clamp( (downLeft.y - uv.y)     / downLeft.y ,0.0, 1.0)); 
    return temp;
}


void colorize(float height, out vec3 outputCol) {
    vec3 temp = vec3(height);
    if (height < OCEAN_LEVEL)
        outputCol = OCEAN_COLOR * (OCEAN_LEVEL - 0.1 + height);
    else if (height < OCEAN_LEVEL + OCEAN_EDGE){
        float x = (height - OCEAN_LEVEL) / OCEAN_EDGE;
        outputCol     = mix(OCEAN_COLOR, temp, x);
    }
        else if (height < MOUNTAIN_LEVEL)
        outputCol = temp * PLAIN_COLOR;
    else if (height < MOUNTAIN_LEVEL_2)
        outputCol = temp * temp * temp * MOUNTAIN_COLOR;
    else 
        outputCol = temp * MOUNTAIN_COLOR;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv         = fragCoord/iResolution.xy;  
    float height    = getHeight(uv);
    float borderLevel   = -0.0;
    float edged = worldEdge(uv, height, borderLevel, vec2(0.45));
    vec3 col;
    colorize(edged, col);
   
    //Clouds
    float clouds = fbm(uv* 10.0);
    clouds = pow(clouds, 5.0);
    clouds = worldEdge(uv, clouds, 0.0, vec2(0.4));
   // col   += clouds / 10.0;
    
    
    //col += temp;
    
    fragColor = vec4(col, edged);
}

//BufferB------------------------

#define Nebula 30.0
#define NebIntensity 1.5
#define stars 700.0
#define colIntensity vec3(1.,0.5,1.0)
//Standard random function and noise to build perlin noise function with addition of octaves


float noise(vec2 uv, float freq) {
    uv *= freq;
    vec2 fractional = fract(uv);
    vec2 integer = floor(uv);
    fractional = fractional*fractional*(3.0-2.0*fractional);
    vec2 down = vec2( rand(integer), rand(integer + vec2(1.0, 0.0)) );
    vec2 up = vec2( rand(integer + vec2(0.0,1.0)), rand(integer + vec2(1.0, 1.0)) );
    float x = mix(down.x, down.y, fractional.x);
    float y = mix(up.x, up.y, fractional.x);
    return mix(x,y, fractional.y);
}


vec3 perlin(vec2 uv, float amplitudeMul, float freqMul,float amplitude, float freq)  {
    vec3 col = vec3(noise(uv, 10.0)*10.0);
    float total = amplitude;
    for (int i = 0; i<5; i++) {
        freq *= freqMul;
        amplitude *= amplitudeMul;
        col += vec3(noise(uv, freq)*amplitude);
        total += amplitude;
    }
    col/= total;
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;   
    vec3 r = perlin(uv, 0.5, 2.0, 100.0, 3.0)*colIntensity.r; //arbitrary values in perlin function to generate "galatical" colors
    vec3 g = perlin(uv+0.1, 0.5, 2.0, 100.0, 3.0)*colIntensity.g;
    vec3 b = perlin(uv + 0.5, 0.5, 4.0, 100.0, 1.0)*colIntensity.b;
    float fade = pow(length(perlin(uv-0.1, 0.6, 2.0, 10.,10.0)),NebIntensity)*Nebula;
    vec3 col = vec3(length(r),length(g), length(b))/sqrt(3.0);
    vec3 sky = vec3(pow(rand(uv), stars));
    sky += col/fade;
    fragColor = vec4(sky,1.0);
}

//MainImage------------------------


//#define LIGHT_MOUSE 1


int   gMaxRaySteps = 50;
float gMinForInter = 0.0001;
vec3  gBgCol       = vec3(0.05, 0.01, 0.01);
vec3  gAmbientLight= vec3(0.004);

vec2  gMouse;

vec3 nullVec3;

vec2 uv0;

vec3 atmCol                   = vec3(0.88,0.88, 1.0);
float atmThickness            = 0.035;
float maxAtmInteriorThickness = 0.35;

struct Camera {
    vec3 position;
    vec3 rotation;
    float nearPlane;
    float farPlane;
};

struct Sphere {
    vec3 position;
    float radius;
    vec3 rotation;
    vec3 color;
};
struct Light {
    vec3 position;
    vec3 color;
};

struct HitInfo {
    vec3   color;
    Sphere sphere;
    float  height;
    
};


//get if ray point->light.position intersect with the sphere s
bool sphereIntersect(in vec3 p, inout Sphere s, inout Light l) {
    float r2   = s.radius * s.radius; //radius squared
    vec3  ray  = normalize(l.position - p);
    p         += ray * 2.0 * gMinForInter;
    float a    = dot(ray, ray);
    float b    = 2.0 * dot(p - s.position, ray);
    float c    = dot(p - s.position, p-s.position) - r2;	
    float s1;
    float s2;
    if (!solveQuadratic(a,b,c, s1, s2))
        return false;
        
	return (s1 > 0.2) || (s2 > 0.2);
}

float sdfSphere(vec3 pos, inout HitInfo hit) {
    vec2 sphereUV;
    
    Sphere sphere     = hit.sphere;
    
    vec3 n     = (pos - sphere.position) / sphere.radius;
    
    sphereUV.x =  atan(n.x, - n.z) / (PI*2.0) + 0.5;
    sphereUV.y =  0.5 + asin(n.y)/PI;
    sphereUV.x += 0.18;
    vec4 sampleBuff = texture(iChannel0, sphereUV);
    hit.color = sampleBuff.xyz;
    
    hit.height = sampleBuff.w; 
    return distance(pos, sphere.position) - sphere.radius - sampleBuff.w * sampleBuff.w *0.0025;
}

vec3 normalSphere(in vec3 pos, in HitInfo sphere) {
    float dis = sdfSphere(pos, sphere);
    vec2  eps = vec2(0.001, 0.0);
    return normalize( dis - vec3(
                      sdfSphere(pos - eps.xyy, sphere),
                      sdfSphere(pos - eps.yxy, sphere),
                      sdfSphere(pos - eps.yyx, sphere)
                     ));
}

void rayMarch(in Camera cam, in vec2 uv, out vec3 col, out vec3 interPos) {
    vec3 currentPosition = vec3(0.0);
    float steps          = 0.0;
    
    
    Sphere s;
    Light  l;
    s.position = vec3(-0.0, -0., 1.3);
    s.radius   = 0.5;
    s.color    = vec3(0.0, 0.0, .0);
    
    l.position = vec3(50.0,50.0, -30.0);
    #ifdef LIGHT_MOUSE
    l.position = vec3(gMouse.x * 13.0, gMouse.y * 13.0, 0.3);
    #endif
    l.color    = vec3(1.0);
    
    HitInfo hit;
    HitInfo hit0;
    
    hit.sphere  = s;
    hit0.sphere = s;
    
    float minNear     = 10000.0;
    float nearestStep = 10000.0;
    
    vec3 rayDir = normalize(vec3(uv.x, uv.y, cam.nearPlane));
    for (int i = 0; i < gMaxRaySteps; i++) {
        float nearest   = sdfSphere(currentPosition, hit);
        steps          += nearest;
        currentPosition = steps * rayDir;
        nearestStep     = min(nearestStep, steps);
        minNear         = min(minNear, nearest); //temp for atmosphere
        

        if (nearest > gMinForInter) {
            continue;
        }
        
 
        
        //Intersection occured
        
     
        vec3 projection =  normalize(-currentPosition + l.position);
        vec3 normal = normalSphere(currentPosition, hit0);
        
        vec3 reflection    = reflect(-projection, normal);
        vec3 viewDir      = normalize(cam.position - currentPosition );
        float p         =  (hit.height  < OCEAN_LEVEL + OCEAN_EDGE) ? 16.0 : 1.0;
        
        float specular  = pow(max(0.0,dot(viewDir, reflection)), p);
        float diffuse   = max(0.0, dot(projection, normal));
        vec3 result     = (specular+diffuse+gAmbientLight)*l.color; 

        //Add atmosphere color
        vec3 snormal = normalize(currentPosition - s.position);
        float atmInt= min(1.0, abs(dot(snormal, normalize(cam.position - s.position))));
        
        col = hit.color;
        col = mix(col, atmCol, min(atmThickness + (1.0 - atmInt) * atmThickness, maxAtmInteriorThickness));
        col*= result;
        return;
       
        //-----------
    }
    //Calculate atmosphere
    vec3 atmPos = nearestStep * rayDir; //Point in atmosphere
    float temp = 0.0;
    
    float tempThick  = max(0.0, dot(normalize(atmPos - s.position), normalize(l.position - s.position )));
    atmThickness     = tempThick * atmThickness;
    
    if (minNear < atmThickness) {
        temp   = 1.0 - (atmThickness - minNear) / atmThickness;
        temp   = exp(-5.0*temp); 
    }
   
    col = mix(texture(iChannel1, uv0).xyz, atmCol, temp);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv  = (fragCoord - 0.5* iResolution.xy)/iResolution.y;
    uv0      = fragCoord.xy / iResolution.xy;
    gMouse   = iMouse.xy    / iResolution.xy;
    
    Camera cam;
    cam.position = vec3(0.0);
    cam.nearPlane = 0.8;
    
    vec3 temp;
    vec3 col;
    rayMarch(cam, uv, col, temp);
    fragColor = vec4((col),1.0);
}




