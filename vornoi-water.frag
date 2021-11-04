https://www.shadertoy.com/view/NtcGWH

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    //----
    const float cellsRootSquare = 10.0;
    const float spd = 4.0;
    const float sep = 1.1;
    const vec3 additiveColor = vec3(0.11, 1.0, 1.0);
    //-----
    const float sinAmplitude = 0.15;
        const float movementAmplitude = 6.28;
    float minDistance = 1.0;
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col =additiveColor;
    uv *= cellsRootSquare;
    
    vec2 intPart = floor(uv);
    vec2 floatPart = fract(uv);
    
    for (int i = 0; i <2; i++) {
        for (int j = 0; j<2; j++)
        {
            vec2 neighbourCell = vec2(float(j), float(i));
            vec2 ourPoint = random2(neighbourCell + intPart);
            ourPoint =  sinAmplitude*(1.0 + sin(iTime*spd + movementAmplitude*ourPoint));
            minDistance = min(minDistance, length(neighbourCell + ourPoint - floatPart));
        }
    };
