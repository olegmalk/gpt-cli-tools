import { DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT, DELIMETER_FOR_FILES, THINKING_DELIMETER } from "../delimeters";
import { PromptType } from "../prompt.type";
import { PROBLEM_SOLVING_SYSTEM_MESSAGE } from "./problem-solving-system";
import { SKIP_THINKING_MESSAGE } from "./skip-thinking";
import { splitSystemMessage } from "./system";


export function createSplitIntoMultipleFilesPrompts(props: {
    code: string,
    isTypeScript: boolean,
    filePath: string,
    filesAndExportNames: string,
}): PromptType {
    const language = props.isTypeScript ? "TypeScript" : "JavaScript";

    const system = `${PROBLEM_SOLVING_SYSTEM_MESSAGE}
    ${splitSystemMessage}
    `;

    const user = `
Original file in language ${language} at path "${props.filePath}":
${props.code}




Absolute paths and export names to create:
${props.filesAndExportNames}




Requirements:
- 1. Do not forget imports in new files you will create, make sure you import everything used in the file you create. React is not available in global scope.
- 2. Remove unused imports from the main file
- 3. Output file path for every file even for the existing one.
- 4. File outputs should be plain test with no formatting or code blocks
- 5. Make sure that the code you output has same behavior as original file code
- 6. Make sure that main file still has some responsibility after splitting down, is not just a wrapper for other file
- 7. Make sure that arguments of the functions you create are as lean as possible.
- 8. Make sure that props of the components you create are as lean as possible.

Tasks:
- Split original file into smaller files given absolute paths and export names of file to create.
- Add test ids that are missing
- Output updated code for each file including absolute file path

Delimiter between thoughts and files section ${THINKING_DELIMETER}
Delimiter between files ${DELIMETER_FOR_FILES}
Delimeter between absolute file path and file content ${DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT}

file path and file content are repeated for each file

Output format:
{replace_with_thinking}
${THINKING_DELIMETER}
{replace_with_absolute_file_path}
${DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT}
{replace_witch_file_content}

${SKIP_THINKING_MESSAGE}
`;
    return { user, system }
}
