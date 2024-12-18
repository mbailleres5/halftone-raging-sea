uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform vec2 uResolution;
uniform float uShadowRepetitions;
uniform vec3 uShadowColor;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
)
{
    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv *= repetitions;
    uv = mod(uv, 1.0);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);

    return mix(color, pointColor, point);
}

void main()
{
    // Wave color mixing
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 waveColor = mix(uDepthColor, uSurfaceColor, mixStrength);

    // View direction and normal
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    // Lights with reduced intensity
    vec3 light = vec3(0.5); // Start with a mid-gray base

    // light += ambientLight(
    //     vec3(0.5), // Lighter ambient color
    //     0.1        // Lower intensity
    // );

    // light += directionalLight(
    //     vec3(0.0, 0.0, 0.0), // Light color
    //     0.1,                 // Lower light intensity
    //     normal,              // Normal
    //     vec3(1.0, 1.0, 0.0), // Light position
    //     viewDirection,       // View direction
    //     0.5                  // Reduced specular power
    // );

    // Blend lighting more subtly
    waveColor *= mix(vec3(1.0), light, 0.5);

    // Apply halftone effects
    waveColor = halftone(
        waveColor,               // Input color
        80.0,                    // Repetitions
        vec3(0.0, -1.0, 0.0),    // Direction
        -0.8,                    // Low
        1.5,                     // High
        uShadowColor,            // Point color
        normal                   // Normal
    );

    // Final output
    gl_FragColor = vec4(waveColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}