//https://www.shadertoy.com/view/std3Dr

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float intensity = 1.0;
    float decreaseSpd = 3.5;
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = vec3(1.0,1.0,1.0);
    vec3 textured = texture(iChannel0,uv).xyz;
    vec2 center = iMouse.xy/iResolution.xy;
    float magnitude =pow( (uv.x - center.x)*(uv.x - center.x) + (uv.y - center.y)*(uv.y - center.y) ,  0.5  );
    col = vec3(1.0-decreaseSpd*magnitude, 1.0-decreaseSpd*magnitude,1.0-decreaseSpd*magnitude)*intensity;
    vec3 fragCol = mix(col, textured, 0.5);
    // Output to screen
    fragColor = vec4(fragCol,1.0);
}
