# Magic-Tool
Automation tool for all your enterprise routine task.

# Motivation
Lets consider a typical release cycle, It has following stages post requirement gathering
1. Sketch user UI Pages and improve them until the stake-holders are happy(Devs,TPM,Arch, etc).
2. Parallely Architects start on the design.
3. TLs gets 2 inputs Desings & Sketch of apps.
4. Execution starts with demo's and feedback flowing back into backlog.
5. After enough features are completed we call it a relase.

![Release Cycle](documentation/Release.png "Release workflow")

The idea behind the tool or why this was written is as follows:
1. A 

![Tool Flow](documentation/flow.png "Tools workflow")

## Tool Json Explained
The following are different sections of tool json
1. Tool json should be named as .magic-tool.json and should be placed in transpiler directory.

## JSON Sections:
1. [Project](documentation/project.md)
2. [Modules](documentation/modules.md)
3. [Components](documentation/components.md)
4. [Layouts](documentation/layouts.md)
5. [Elements](documentation/elements.md)