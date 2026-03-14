# add-requirement

## Instruction

1. See the latest number of `additional-requirement-*.md` file in `agents/requirements/` directory
2. Create new file `additional-requirement-*.md` in `agents/contexts` directory with the same number
3. Add detailed instruction into the created file, based on the `agents/requirements/additional-requirement-*.md` file

- At top of file, add the instruction to read the `agents/contexts/instruction.md` first
- Add "Important" section with instruction to do only single step at a time and update `agents/contexts/implemented.md` after finishing each step
- Break down the requirement into smaller actionable steps
- If it the constraint that change the way of working, add it into `agents/contexts/instruction.md` file

4. link additional requirement file in `agents/contexts/instruction.md` file to the created file
