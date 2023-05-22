export const PROJECT_GUIDELINES = `Guidelines:

- G1. Interfaces over types: Favor implementing an interface instead of using types, unless a type union is imperative.
- G2. Each file should have only one named export.

Filename protocols:
- FP1. Adopt kebab-case for filenames.
- FP2. Apply the suffix .template.tsx to stateless React component files.
- FP3. Use .component.tsx for React components that contain state.
- FP4. Interface files should end with .interface.ts.
- FP5. Type files should bear the suffix .type.ts.
- FP6. Append .hook.ts to the filenames for hooks.
- FP7. File name should not contain it's folder name.

Naming conventions for named exports:
- NC1. Begin with a capital letter for React component exports.
- NC2. Use the CamelCase pattern \${folder_name}\${file_name} for the export name.
- NC3. Example: filePath - /user/project/src/some-folder/random.component.tsx, exportName - SomeFolderRandomComponent.
- NC4. For hooks, follow the use\${folder_name}\${file_name} pattern, excluding 'hook' from the name even if present in the filename.
- NC5. Example: filePath - /user/project/src/some-folder/good.hook.tsx, exportName - useSomeFolderGood.
- NC6. Example: filePath - /user/property-card/get-info-data.ts - propertyCardGetInfoData
`