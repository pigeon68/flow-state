uniform float uTime;
uniform float uDelta;
uniform sampler2D uBaseTexture;
uniform sampler2D uTexture;

uniform float uDecaySpeed;

uniform float uPerlinFrequency;
uniform float uPerlinMultiplier;
uniform float uTimeFrequency;
uniform float uSeed;

uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseStepLimit;

varying vec2 vUv;

#pragma glslify: perlin3d = require('../noise/perlin3d.glsl')

void main()
{
    vec4 color = texture2D(uTexture, vUv);
    color.a -= uDecaySpeed * uDelta;

    if(color.a <= 0.0)
    {
        color.rgb = texture2D(uBaseTexture, vUv).rgb;
        color.a = 1.0;
    }
    else
    {
        vec4 baseColor = color;

        float time = uTime * uTimeFrequency;
        float perlinMultiplier = uPerlinMultiplier * uDelta * 0.1;

        vec2 toMouse = baseColor.xy - uMouse;
        float dist = max(length(toMouse), 0.0001);
        float influence = exp(-pow(dist / uMouseRadius, 2.5));
        vec2 repelDir = toMouse / dist;
        float dt = min(uDelta, 33.0);
        vec2 repel = repelDir * influence * uMouseStrength * dt * 0.0015;

        float repelLen = length(repel);
        if(repelLen > uMouseStepLimit)
        {
            repel = repel / repelLen * uMouseStepLimit;
        }

        color.rg += repel;

        color.r += perlin3d(uSeed + vec3(baseColor.gb * uPerlinFrequency           , time)) * perlinMultiplier;
        color.g += perlin3d(uSeed + vec3(baseColor.rb * uPerlinFrequency + 123.45  , time)) * perlinMultiplier;
        color.b += perlin3d(uSeed + vec3(baseColor.rg * uPerlinFrequency + 12345.67, time)) * perlinMultiplier;
    }

    gl_FragColor = color;
}
