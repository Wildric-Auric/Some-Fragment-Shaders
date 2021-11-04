//https://www.shadertoy.com/view/Nt3GD8
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
