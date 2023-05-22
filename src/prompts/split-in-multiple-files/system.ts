export const splitSystemMessage = `
This is react native project.

Remember to check the file imports before suggesting to extract something in different file, because it may be already in different file.
The file path for the new files you create should be absolute and should be in the same folder as original file.
Test ids format is component-element-...-element with at lease one element.
File names should be in kebab-case.
If the file is a template component, the file name should end with .template.tsx.
If the file is a component, the file name should end with .component.tsx.
If the file is a utility function, the name should end with ts.
If the file is a untility function, the export name should start with lower case.
The export name in the new files you will create should be the folder of the file + file name without extension in CamelCase. Example: if you create a file with this path folder-name/file-name.template.tsx, then name is FolderNameFileNameTemplate.
`