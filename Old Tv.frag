//https://www.shadertoy.com/view/ft33RS

loat rect(vec2 uv, float start, float end, float down, float top, float blur)
{
    float res = smoothstep(start-blur, start+blur, uv.x);
    float res1 = smoothstep(end+blur, end-blur, uv.x);
    float res3 = smoothstep(down-blur, down+blur, uv.y);
    float res4 = smoothstep(top+blur, top-blur, uv.y);
    return res * res1 * res3 * res4;
}

vec3 rect2(vec2 uv, float position, float size)
{
    vec3 color = vec3(step(0.0,uv.x));
    color *= vec3(step(0.0, 1.0-uv.x));
    color *= vec3(step(1.0 - size-position,uv.y));
    color *=vec3(step(position,1.0-uv.y));
    return color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    vec3 linesColor = vec3(0.9,0.9,0.9); //Should never be strictly 0,0,0
    float size = iResolution.y/2000000.0;
    float space = 0.0025;
    vec3 bloomColor = vec3(1.0,1.0,1.0);
    float bloomDiff = 0.2;
    float pct = 1.;
    float offsetValue = 0.01;
    vec3 finalCol;
    float offsetPower = 0.3;//Between 0 and 1
    
    float current = 0.0;
    vec3 linesAddition = vec3(0.0,0.0,0.0);
    while (current != 1.0) 
    {
        vec3 c = rect2(uv,current, size);
        current = min(1.0, current + size + space);
        linesAddition += linesColor*c*texture(iChannel3,uv).xyz;
    }
    if (linesAddition == vec3(0.0,0.0,0.0))
    {
        finalCol = texture(iChannel3,uv).xyz;
        finalCol = mix(finalCol, texture(iChannel3,uv+offsetValue).xyz, offsetPower);
  
    }
    else {
        finalCol = linesAddition;
        finalCol = mix(finalCol, texture(iChannel3,uv+2.*offsetValue).xyz, 0.5*offsetPower);
    }
    //A pseudo bloom effect
    if (length(finalCol - bloomColor) < bloomDiff)
    {
        finalCol += pct;
    }

    fragColor = vec4(finalCol, 1.0);

}

