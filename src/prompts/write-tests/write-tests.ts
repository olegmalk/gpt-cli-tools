import { DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT, THINKING_DELIMETER } from "../delimeters";
import { PromptType } from "../prompt.type";
import { PROBLEM_SOLVING_SYSTEM_MESSAGE } from "../split-in-multiple-files/problem-solving-system";
import { SKIP_THINKING_MESSAGE } from "../split-in-multiple-files/skip-thinking";


export function createUnitTestPrompt(props: {
    code: string,
    isTypeScript: boolean,
    filePath: string,
}): PromptType {
    const language = props.isTypeScript ? "TypeScript" : "JavaScript";

    const system = `${PROBLEM_SOLVING_SYSTEM_MESSAGE}
    you will need to co
    `;

    const user = `
Original file in language ${language} at path "${props.filePath}":
${props.code}


Project context:
- PC1. This is react native project.

Requirements:
- R1. Test file should be created in folder __tests__ next to the file under test.
- R2. If you writing tests for react components add following imports
import {render} from '@testing-library/react-native';
import {TestWrapperComponent} from '~/library/test-wrapper/component';
Add import for the file under test.
- R3. Do not mock ‘react’, ‘./styled’. Mock other imports.
- R4. Do not import mocked imports using import statement.
- R5. Use jest.requireMock to import mocked imports, Remember about named imports, you should write like this jest.requireMock('path').nameOfExport
- R6. Use mockReturnValue, to set the return values of the mocked imports, this should be done inside beforeEach inside describe
- R7. Do not include jest.clearAllMocks();
- R8. Do not mock any types or interfaces
- R9. Test file name should be same as original file name but with .spec. suffix before extension.
- R10. Do not mock react-native
- R11. All the data mocks you make should have type any

Task:
- Identify all the tests that need to be written for the test file to get 100% test coverage. Think from different perspectives.
- Write all the tests in the test file.
- Provide absolute path to the test file.
- Identify the file name of the original file
- Identify the import path in the test for original file. It will be "../original-file-name" because the test file is in __tests__ folder and __tests__ folder is next to the original file under test.




Delimiter between thoughts and files section ${THINKING_DELIMETER}

Output format:
{replace_with_thougths}
${THINKING_DELIMETER}
{replace_with_test_absolute_file_path}
${DELIMETER_BETWEEN_FILEPATH_AND_FILE_CONTENT}
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
{replace_with_imports}
{replace_with_mock_modules} (jest.mock, optional add this section only if there is something required to be mocked) */
{replace_with_get_access_to_mocked_modules} (jest.requireMock, optional add this section only if there is something required to be mocked) */
{replace_with_data_mocks} (optional add this section only if there is something data to be mocked) */
{replace_with_describe_block}
   {replace_with_before_each_to_set_mock_return_values} (optional add this section only if there is something required to be mocked) */

${SKIP_THINKING_MESSAGE}
`;
    return { user, system }
}
