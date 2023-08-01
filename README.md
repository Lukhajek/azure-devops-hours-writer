# azure-devops-hours-writer

## Overview

`azure-devops-hours-writer` is a command-line tool that simplifies the process of transferring hours from a Clockify CSV report to Azure DevOps.

## Features

- **CSV Report Integration:** Reads hours from a Clockify CSV report, eliminating the need for manual data entry.
- **Azure DevOps Integration:** Integrates with Azure DevOps to write the hours into the appropriate work items effortlessly.

## Prerequisites

Before using `azure-devops-hours-writer`, make sure you have the following:

- **Node.js:** Ensure Node.js is installed on your machine.
- **Clockify CSV Report:** Prepare a Clockify CSV report containing the hours you want to transfer. For seamless mapping to work items, use only the work item ID in the task names.
- **Azure DevOps Organization:** Access to an Azure DevOps organization with appropriate permissions to update work items.

## Installation

Using `azure-devops-hours-writer` is as simple as running a single command with `npx`, which comes bundled with Node.js. To execute the tool, open your terminal and run the following command:

```bash
npx azure-devops-hours-writer
```

## Usage

1. **Export Clockify Report:** Export the required Clockify report as a CSV file from your Clockify account.

2. **Open Terminal:** Launch your terminal or command prompt.

3. **Navigate to Directory:** Change the directory to the location where the Clockify CSV report is saved.

4. **Run Command:** Execute the following command in the terminal:

```bash
npx azure-devops-hours-writer
```

5. **Provide Information:** The tool will prompt you to enter the necessary information:

   a. **Path to the CSV Report File:** Enter the name of the CSV file with the Clockify report.

   b. **Azure DevOps Organization Name:** Provide the name of your organization from the Azure DevOps dashboard URL (e.g., https://dev.azure.com/**orgname**).

   c. **Azure DevOps token:** Input the UserAuthentication cookie value from the Azure DevOps dashboard.

6. **Process and Update:** The tool will process the CSV file and automatically write the hours into the respective Azure DevOps work items based on the provided data.

7. **Summary and Error Handling:** Upon successful completion, the tool will display a summary of the work items updated and any potential errors encountered during the process.

## Notes

- The tool automatically maps Clockify tasks to the corresponding work items in Azure DevOps. Ensure that the task names in Clockify match the work item IDs in Azure DevOps for accurate mapping.

- For any issues or errors, the tool provides relevant error messages to help you troubleshoot and address any discrepancies.

- After the process is completed, we recommend reviewing the work items in Azure DevOps to ensure accuracy and making any necessary adjustments manually.

## Contribution

We appreciate contributions to `azure-devops-hours-writer`. If you encounter any bugs, have feature requests, or wish to improve the tool's functionality, please feel free to submit issues or pull requests on our GitHub repository. Your feedback helps us enhance the tool for everyone.
