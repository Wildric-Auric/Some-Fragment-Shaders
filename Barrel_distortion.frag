//https://www.shadertoy.com/view/NlK3DR

const float ZCoord = 0.5;
const float norm = 0.35; // ZCoord as max value
const float lensRadius = 0.2;
const float blur = 3.;
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec3 uv = vec3(fragCoord/iResolution.xy, 0.0);
    vec3 tex = textureLod(iChannel0, uv.xy,blur).xyz;
    vec2 mouse = iMouse.xy/iResolution.xy;
    if (iMouse.xy==vec2(0.0,0.0)) mouse = vec2(0.5,0.5);
    vec3 sphereCenter = vec3(mouse.xy,ZCoord);
    vec3 tempVector = uv - sphereCenter;
    float len = length(tempVector);
    vec3 new = (tempVector/len)*norm;
    uv -= new;
    if (distance(mouse,uv.xy)<lensRadius)
    {
        tex = texture(iChannel0, uv.xy).xyz;
    }

    fragColor = vec4(tex,1.0);
}
