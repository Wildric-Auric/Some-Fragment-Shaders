
//https://www.shadertoy.com/view/ssdBDs

//Scales shape parameters
float SHAPE_HORIZONTAL_RADIUS  =0.3;
float SHAPE_VERTICAL_RADIUS = 1.8;
float PATTERN_FREQUENCY = 6.0;


//Color Parameters
#define SCALE_COLOR vec3(1.0,1.0,1.0)
#define NOISE false
#define BLACK_BORDER true
#define COLOR_INTENSITY 1.0

#define RANDOMIZE_COLOR false
#define colIntensity vec3(1.0,1.0,1.0)



//Light Parameters
#define LIGHT false
#define LIGHT_COLOR vec3(1.0, 1.0, 1.0)
#define LIGHT_INTENSITY 1.0


//Animation parameters

#define ANIMATION true
#define ANIMATION_SPEED 0.5


//OTHER

#define LIGHT_Z_POS 0.05





//-----------------------------------------------------------

vec2 originalUV = vec2(0.0);
bool passed = false;
vec3 lightPosition = vec3(0.5,0.5,LIGHT_Z_POS);



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


vec3 CalculateNormal(vec2 coord,float len) {
    return normalize(
           vec3(
                coord.x*0.4,
                coord.y*0.4,
                1.0
                )
            );
}


vec3 MagicalColorRandomizer(vec2 uv) {
    vec3 r = perlin(uv, 0.5, 2.0, 100.0, 3.0)*colIntensity.r; //arbitrary values in perlin function to generate "galatical" colors
    vec3 g = perlin(uv+0.1, 0.5, 2.0, 100.0, 3.0)*colIntensity.g;
    vec3 b = perlin(uv + 0.5, 0.5, 4.0, 100.0, 1.0)*colIntensity.b;
    float fade = pow(length(perlin(uv-0.1, 0.6, 2.0, 10.,10.0)), 30.0)*4.0;
    return vec3(length(r),length(g), length(b))/sqrt(3.0);

}




vec3 Lit(vec2 position, vec3 normal) {
    vec3 dir = normalize(vec3(position.x,position.y, 0.0) - lightPosition);
    return -LIGHT_INTENSITY*dot(dir, normal) * LIGHT_COLOR;
    
}




vec3 ShapePattern(vec2 uv,vec2 center) {
    uv -= center;
    vec2 localCoord = (uv + vec2(SHAPE_HORIZONTAL_RADIUS*0.5, 0.0))
                       /vec2(SHAPE_HORIZONTAL_RADIUS, SHAPE_VERTICAL_RADIUS);
                   
    localCoord.y = -localCoord.y;     
   
    float f = SHAPE_HORIZONTAL_RADIUS ;//* (2.0 - smoothstep(0.0, .,localCoord.y));
    float len = pow(uv.x/(f), 2.0) +  pow(uv.y/SHAPE_VERTICAL_RADIUS, 2.0);
    float offsetu = 0.0;
    
    if (  len<= 1.3 + offsetu && uv.y < 0.0) {
        //Point is inside the shape
        passed = true;

        vec3 result =  SCALE_COLOR * vec3(smoothstep(0.0,0.15,localCoord.y/2.0));
        if (RANDOMIZE_COLOR) {
            result *= MagicalColorRandomizer(originalUV);
        };
        if ( NOISE ) result *= 2.0* noise(localCoord, 1.0);
        if (BLACK_BORDER) {
                result *= vec3(smoothstep(1.0, 0.0,len/3.0));
        }
        if (LIGHT) 
            result *= Lit(originalUV, CalculateNormal(localCoord,len));
        return result ; 
         
        
    }
    return vec3(0.0,0.0,.0);
}



void mainImage( out vec4 fragColor, in vec2 fragCoord )
{


    vec2 uv = fragCoord/iResolution.xy;
    PATTERN_FREQUENCY = 6.0 + 0.5*(sin((cos(iTime*ANIMATION_SPEED) - uv.x * uv.y)*2.0)+1.0);
   

    //PATTERN_FREQUENCY = 6.0 + sin(iTime);
    originalUV = uv;
    uv *= float(PATTERN_FREQUENCY);

	uv.x += 0.05*sin(uv.y*10.0+iTime)/10.0;
    
    vec2 mouse = iMouse.xy/iResolution.xy;
    lightPosition.xy = mouse.xy;
    
    vec3 col = vec3(0.0);
   
   
    float offset = 0.0;
    for (int y = 0; y < int(float(PATTERN_FREQUENCY)/(SHAPE_VERTICAL_RADIUS)*2.0)+4; y++) {
        for (int x = 0; x < int(float(PATTERN_FREQUENCY)/2.0/SHAPE_HORIZONTAL_RADIUS)+3; x++) {
               if (passed) break;
               vec2 center = vec2( (2.0*float(x) + offset) * float(SHAPE_HORIZONTAL_RADIUS),
                                    float(PATTERN_FREQUENCY)+1.0- float(y)*SHAPE_VERTICAL_RADIUS*0.5);
               col += ShapePattern(uv, center);
       }
       offset = 1.0 - offset;
    }
    
    // Output to screen
    fragColor = vec4(col + 0.15,1.0);
}
