// import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceProject, WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { getWorkspace } from '@schematics/angular/utility/config';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function addStyles(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, _options.project);
    addStyleToTarget(project, 'build', tree, _options.stylePath, workspace);
    addStyleToTarget(project, 'test', tree, _options.stylePath, workspace);
    return tree;
  };
}

function addStyleToTarget(project: WorkspaceProject, targetName: string, host: Tree,
  assetPath: string, workspace: WorkspaceSchema) {

  const targetOptions = getProjectTargetOptions(project, targetName);

  if (!targetOptions.styles) {
    targetOptions.styles = [assetPath];
  } else {

    const existingStyles = targetOptions.styles
      .map((style: string | { input: string }) => {
        return typeof style === 'string' ? style : style.input;
      });

    const hasBootstrapStyle = existingStyles.find(
      (style: string) => {
        return style.includes(assetPath);
      });

    if (!hasBootstrapStyle) {
      targetOptions.styles.unshift(assetPath);
    }
  }

  host.overwrite('angular.json', JSON.stringify(workspace, null, 2));
}

function getProjectTargetOptions(project: WorkspaceProject, buildTarget: string) {
  const targetConfig = project.architect && project.architect[buildTarget] ||
    project.targets && project.targets[buildTarget];

  if (targetConfig && targetConfig.options) {

    return targetConfig.options;
  }

  throw new Error(`Cannot determine project target configuration for: ${buildTarget}.`);
}

function getProjectFromWorkspace(workspace: WorkspaceSchema, projectName?: string): WorkspaceProject {

  /* tslint:disable-next-line: no-non-null-assertion */
  const project = workspace.projects[projectName || workspace.defaultProject!];

  if (!project) {
    throw new Error(`Could not find project in workspace: ${projectName}`);
  }

  return project;
}