//https://www.shadertoy.com/view/Nt3GD8



//conversion from the Book of shaders 			
//https://thebookofshaders.com/06/
vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

//--------------------------------------------
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy/iResolution.xy;
    vec3 color = vec3(0.0);

    //Play with these parameters
    const float amplitude = 10.0;
    const float inverseSpd = 5.0;
    const float size = 3.0;
    const float clearness = 1.5;
    const bool MOUSECENTER = false;
    //Shader logic
    vec2 center = vec2(0.5,0.5);
    if (MOUSECENTER) {  center = iMouse.xy/iResolution.xy; }

    float magnitude = pow( (uv.x-center.x)*(uv.x-center.x)+
                    	    (uv.y-center.y)*(uv.y-center.y) 
                    		,0.5);
    float variation = amplitude*sin(iTime/inverseSpd);
    color = hsb2rgb(vec3(variation - size*magnitude,clearness,1.0));

    fragColor = vec4(color,1.0);
}
