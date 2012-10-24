/**
 * @namespace
 * @name pc.gfx.programlib
 */
pc.gfx.programlib = {
    getSnippet: function (id) {
        var code = '';

        switch (id) {
             case 'common_main_begin':
                code +=    'void main(void)\n{\n';
                break;

            case 'common_main_end':
                code += '}\n';
                break;

            //////////////////////////////
            // FRAGMENT SHADER SNIPPETS //
            //////////////////////////////
            case 'fs_alpha_test_decl':
                code += 'uniform float alpha_ref;\n';
                break;

            case 'fs_alpha_test':
                code += '    if (gl_FragColor.a <= alpha_ref)\n';
                code += '    {\n';
                code += '        discard;\n';
                code += '    }\n\n';
                break;

            case 'fs_clamp':
                code += '    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);\n';
                break;

            case 'fs_flat_color_decl':
                code += 'uniform vec4 uColor;\n';
                break;

            case 'fs_flat_color':
                code += '    gl_FragColor = uColor;\n';
                break;

            case 'fs_fog_decl':
                code += 'uniform vec4 fog_color;\n';
                code += 'uniform float fog_density;\n\n';
                break;

            case 'fs_fog':
                // Calculate fog (equivalent to glFogi(GL_FOG_MODE, GL_EXP2);
                code += '    const float LOG2 = 1.442695;\n';
                code += '    float z = gl_FragCoord.z / gl_FragCoord.w;\n';
                code += '    float fogFactor = exp2(-fog_density * fog_density * z * z * LOG2);\n';
                code += '    fogFactor = clamp(fogFactor, 0.0, 1.0);\n';
                code += '    gl_FragColor.rgb = mix(fog_color, gl_FragColor.rgb, fogFactor);\n';
                break;

            case 'fs_precision':
                code += 'precision mediump float;\n\n';
                break;

            case 'fs_depth_write':
                if (pc.gfx.Device.getCurrent().extDepthTexture) {
                    code += '    gl_FragData[0] = vec4(1.0);\n';
                } else {
                    // Using a bit-shift of vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0)
                    // and a bit-mask of    vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0)
                    code += '    vec4 packedDepth = fract((gl_FragCoord.z * vec4(1.67772e+07, 65536.0, 256.0, 1.0)));\n';
                    code += '    gl_FragData[0] = (packedDepth - (packedDepth.xxyz * vec4(0.0, 0.00390625, 0.00390625, 0.00390625)));\n'
                }
                break;

            ////////////////////////////
            // VERTEX SHADER SNIPPETS //
            ////////////////////////////
            case 'vs_skin_position_decl':
                var numBones = pc.gfx.Device.getCurrent().getBoneLimit();
                code += 'attribute vec3 vertex_position;\n';
                code += 'attribute vec4 vertex_boneWeights;\n';
                code += 'attribute vec4 vertex_boneIndices;\n';
                code += 'uniform mat4 matrix_pose[' + numBones + '];\n';
                code += 'uniform mat4 matrix_viewProjection;\n\n';
                break;

            case 'vs_skin_position':
                code += '    vec4 position, positionW;\n';
                code += '    position = vec4(vertex_position, 1.0);\n';
                code += '    positionW  = vertex_boneWeights[0] * matrix_pose[int(vertex_boneIndices[0])] * position;\n';
                code += '    positionW += vertex_boneWeights[1] * matrix_pose[int(vertex_boneIndices[1])] * position;\n';
                code += '    positionW += vertex_boneWeights[2] * matrix_pose[int(vertex_boneIndices[2])] * position;\n';
                code += '    positionW += vertex_boneWeights[3] * matrix_pose[int(vertex_boneIndices[3])] * position;\n';
                code += '    gl_Position = matrix_viewProjection * positionW;\n';
                break;

            case 'vs_skin_normal':
                code += '    vec3 normalW, normalE;\n';
                code += '    vec4 normal = vec4(vertex_normal, 0.0);\n';
                code += '    normalW  = (vertex_boneWeights[0] * matrix_pose[int(vertex_boneIndices[0])] * normal).xyz;\n';
                code += '    normalW += (vertex_boneWeights[1] * matrix_pose[int(vertex_boneIndices[1])] * normal).xyz;\n';
                code += '    normalW += (vertex_boneWeights[2] * matrix_pose[int(vertex_boneIndices[2])] * normal).xyz;\n';
                code += '    normalW += (vertex_boneWeights[3] * matrix_pose[int(vertex_boneIndices[3])] * normal).xyz;\n';
	            code += '    normalE = normalize((matrix_view * normalW).xyz);\n';
                break;

            case 'vs_skin_tangent':
                code += '    vec3 tangentW, tangentE;\n';
                code += '    vec4 tangent = vec4(vertex_tangent, 0.0);\n';
                code += '    tangentW  = (vertex_boneWeights[0] * matrix_pose[int(vertex_boneIndices[0])] * tangent).xyz;\n';
                code += '    tangentW += (vertex_boneWeights[1] * matrix_pose[int(vertex_boneIndices[1])] * tangent).xyz;\n';
                code += '    tangentW += (vertex_boneWeights[2] * matrix_pose[int(vertex_boneIndices[2])] * tangent).xyz;\n';
                code += '    tangentW += (vertex_boneWeights[3] * matrix_pose[int(vertex_boneIndices[3])] * tangent).xyz;\n';
	            code += '    tangentE = normalize((matrix_view * tangentW).xyz);\n';
                break;

            case 'vs_static_position_decl':
                code += 'attribute vec3 vertex_position;\n';
                code += 'uniform mat4 matrix_model;\n';
                code += 'uniform mat4 matrix_viewProjection;\n\n';
                break;

            case 'vs_static_position':
                code += '    vec4 positionW = matrix_model * vec4(vertex_position, 1.0);\n';
                code += '    gl_Position = matrix_viewProjection * positionW;\n';
                break;
        }

        return code;
    }
};
