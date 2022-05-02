#define Nebula 30.0
#define NebIntensity 4.0
#define stars 175.0
#define colIntensity vec3(1.5,.5,1.0)
//Standard random function and noise to build perlin noise function with addition of octaves
float rand(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

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
    for (int i = 0; i<10; i++) {
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
