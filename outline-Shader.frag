//https://www.shadertoy.com/view/flc3WM


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

       
    //Parameters to play with
    vec3 outlineColor =vec3(0.0,0.,0.);
    int depth = 4;
    float errorField = 0.01;
    //----------------------
    
    
    
    vec2 uv = fragCoord/iResolution.xy;
    float pixelX = 1.0/iResolution.x;
    float pixelY = 1.0/iResolution.y;

    vec3 bgColor = vec3(13,163,37);
    bgColor /= 255.0;
    
    vec3 jeanClaudePixel = texture(iChannel0, uv).xyz;
    vec3 neighbourTexel;

    
    int temp = 0;
    for (int i = -depth; i<=depth; i++) 
    {
        for (int j = -depth; j <=depth; j++)
        {
            neighbourTexel = texture(iChannel0, uv+vec2(pixelX*float(i), pixelY*float(j))).xyz;
            if (length(neighbourTexel - bgColor)<=errorField)
            {
                temp += 1;
            }
        }
    }
    if (temp >0 && temp < (2*depth+1)*(2*depth-1)-1) jeanClaudePixel = outlineColor;
    
    fragColor = vec4(jeanClaudePixel,1.0);
}
