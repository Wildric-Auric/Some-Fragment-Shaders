//https://www.shadertoy.com/view/ft3GRB

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float resolution = 2.0; //The highest it is the more pixilized the image gets; it's actually "de-resolution"
    float spd = .5;
    resolution = 0.0 + abs(10.0*cos(iTime*spd));
    
    
    //Considering the widget ratio does not change
    vec2 uv = fragCoord/iResolution.xy;
    vec2 pixel = 1.0/iResolution.xy;
    vec2 cellNum = vec2(640,360)/resolution;
    
    vec2 unit = 1.0/vec2(cellNum);
    vec2 currentCellCoord = floor(uv/unit);
    //Calculate the average in that cell
    float total = 0.0;
    vec3 average = vec3(0.0,0.0,0.0);
    float minI = currentCellCoord.x*unit.x;
    float maxI = (currentCellCoord.x+1.0)*unit.x;
    float minJ = currentCellCoord.y*unit.y;
    float maxJ = (currentCellCoord.y+1.0)*unit.y;
    for (float i = minI; i < maxI; i += pixel.x) 
    {
        for (float j = minJ; j < maxJ; j+=pixel.y)
        {
            average += texture(iChannel0, vec2(i,j)).xyz;
            total += 1.;
        }
    }
    average /= total;
    vec3 col = average;

    fragColor = vec4(col,1.0);
}
