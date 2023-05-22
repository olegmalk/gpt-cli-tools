import { THINKING_DELIMETER } from "../delimeters";
import { PROJECT_GUIDELINES } from "../generic/project-guidelines";
import { PromptType } from "../prompt.type";
import { PROBLEM_SOLVING_SYSTEM_MESSAGE } from "./problem-solving-system";
import { SKIP_THINKING_MESSAGE } from "./skip-thinking";
import { splitSystemMessage } from "./system";


export const ANALYZE_FILES_TASK = `
Rules:
- R1. you are not allowed to extract interfaces or types into separate files
- R2. you should not propose extracting styled components into separate files

Task: Split original file into multiple files to simplify testing and maintainability.
Let's solve it in a step by step way.
Think about
- what parts of the code in original file can be extracted into separate files (JSX markup, parts of render function) think at least 5 cases?
- what parts should not be extracted into separate files (types)?
- think of what you missed when you thought for the first time, may be there is more meaningful parts to be extracted?
`

export function createSplitIntoMultipleFilesAnalyzeFilePrompt(props: {
    code: string,
    isTypeScript: boolean,
    filePath: string
}): PromptType {
    const language = props.isTypeScript ? "TypeScript" : "JavaScript";

    const system = `${PROBLEM_SOLVING_SYSTEM_MESSAGE}
    ${splitSystemMessage}
    `;

    const user = `
Original file in language ${language} at path "${props.filePath}":
${props.code}





${PROJECT_GUIDELINES}




${ANALYZE_FILES_TASK}


Final solution format for each new file: {absolute_file_path} - {export_name}
absolute file path and file content are repeated for each file
It should be placed in replace_with_final_solution_as_list_of_file_names_and_export_names
replace_with_final_solution_as_list_of_file_names_and_export_names should not contain anything else apart from list of absolute file path and export name pairs


Delimiter between thoughts and files section ${THINKING_DELIMETER}

Output format:
{replace_with_thinking}
${THINKING_DELIMETER}
{replace_with_final_solution_as_list_of_file_names_and_export_names}

${SKIP_THINKING_MESSAGE}
`;
    return { user, system }
}
