//https://www.shadertoy.com/view/NtcGWH

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    
    vec2 uv = fragCoord/iResolution.xy;
    
    //Change iChanne1 to change distortion pattern



    const float radius = .4;
    const float distortionIntensity = 0.02;
    const bool followMouse = true;
    const float maxDistortion = 0.08;  //The smaller this value is the more london get distorted at the center
    
    
    // Time varying pixel color
    vec3 col = vec3(0.0,0.0,0.0);
    vec3 noise = texture(iChannel1,uv).xyz;
    
    vec2 center = vec2(0.5,0.5);
    if (followMouse) center = iMouse.xy/iResolution.xy;
    float magnitude = length(vec2(center.x - uv.x, center.y - uv.y));
    
    uv += (noise.xy/max(maxDistortion,magnitude*magnitude))*distortionIntensity;
    
    vec3 Noisylondon = texture(iChannel0,uv).xyz;
    fragColor = vec4(Noisylondon,1.0);
}
