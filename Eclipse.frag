//Common

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
   ret += 0.5     * noise(2.0 * pos);
   ret += 0.25    * noise(4.0 * pos);
   ret += 0.125   * noise(8.0 * pos);
   ret += 0.0625  * noise(16.0* pos);
   ret += 0.03125 * noise(32.0  * pos);
   
   return ret;
}

vec3 aces(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float aces(float x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 unreal(vec3 x) {
  return x / (x + 0.155) * 1.019;
}

float unreal(float x) {
  return x / (x + 0.155) * 1.019;
}

vec3 uncharted2Tonemap(vec3 x) {
  float A = 0.15;
  float B = 0.50;
  float C = 0.10;
  float D = 0.20;
  float E = 0.02;
  float F = 0.30;
  float W = 11.2;
  return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}

vec3 uncharted2(vec3 color) {
  const float W = 11.2;
  float exposureBias = 2.0;
  vec3 curr = uncharted2Tonemap(exposureBias * color);
  vec3 whiteScale = 1.0 / uncharted2Tonemap(vec3(W));
  return curr * whiteScale;
}

float uncharted2Tonemap(float x) {
  float A = 0.15;
  float B = 0.50;
  float C = 0.10;
  float D = 0.20;
  float E = 0.02;
  float F = 0.30;
  float W = 11.2;
  return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}

float uncharted2(float color) {
  const float W = 11.2;
  const float exposureBias = 2.0;
  float curr = uncharted2Tonemap(exposureBias * color);
  float whiteScale = 1.0 / uncharted2Tonemap(W);
  return curr * whiteScale;
}

float sdfbox(vec2 point, vec2 boxRect)
{
   vec2 delta = abs(point) - boxRect;
   return length(max(delta, 0.0)) + min(max(delta.x,delta.y),0.0); 
}

//MainImage-----------------------
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord/iResolution.xy - 0.5) * vec2(1.0, iResolution.y / iResolution.x);
    vec2 uv0 = fragCoord/iResolution.xy;
    vec2 lineOffset = vec2(0.0,0.0);
    vec2  pos   = vec2(uv.x, uv.y - 0.12);
    vec2  linePos = vec2(uv.x, uv.y) - vec2(0.0, -0.222);
    float r     = 0.38;
    float l     = length(pos) / r;
    vec2  n     = pos/l;
    
    vec3 ecol = vec3(float(0xF2), float(0x50), float(0x1D)) / 255.0;
    vec3 col = vec3(0.0);
    float d = l; //- fbm(n*30.0)*0.01;
    vec2 tresh  = vec2(0.95, 1.0)*r;
    tresh.y += fbm(n*10.0)* (-0.01);
    vec2 tresh0 = vec2(tresh.x - 0.02*r,tresh.x);
    col = smoothstep(tresh0.x,tresh0.y,d) * vec3(1.0); 
    
    bool outside = false;
    if (d > tresh.x && tresh.y < 1.0) {
        float coord = (d - tresh.x) / (tresh.y - tresh.x);
        col = ecol / (coord);
        outside = true;
    }
    //-------------
    float lrect = sdfbox(linePos, vec2(0.0,0.2));  
    col   += uv0.y * ecol*0.007/abs(lrect);
    //--------------
    
    //Clouds
    float   c  = pow(fbm(vec2(fbm(uv0*7.), fbm(uv0*15.0))),10.0);
    vec3 bg   = vec3(c);
    if (outside == true)
        col += c *0.001* ecol;
    col = tanh(unreal(col));
    fragColor = vec4(col,1.0);
}
