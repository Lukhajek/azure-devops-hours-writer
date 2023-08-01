#!/usr/bin/env node

import axios from "axios";
import chalk from "chalk";
import csvtojson from "csvtojson";
import fs from "fs";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

const buildAuthHeaders = (token) => ({
  Cookie: `UserAuthentication=${token};`,
});

const confirmContinue = async () => {
  const { confirm } = await inquirer.prompt({
    name: "confirm",
    type: "confirm",
    message: "Do you want to continue?",
  });
  if (!confirm) {
    process.exit(0);
  }
};

const formatReport = (report) => {
  return report.map((item) => ({
    description: item["Description"],
    hours: item["Time (decimal)"],
  }));
};

(async () => {
  const { fileName } = await inquirer.prompt({
    name: "fileName",
    type: "input",
    message: "Enter the path to the file with the report",
    default() {
      const files = fs.readdirSync(process.cwd());
      const csvFiles = files.filter((file) => file.endsWith(".csv"));
      if (csvFiles.length === 1) {
        return csvFiles[0];
      }
      return "./report.csv";
    },
  });
  var report;
  try {
    report = await csvtojson().fromFile(fileName);
    report = formatReport(report);
  } catch {
    console.log("Invalid file");
    process.exit(1);
  }

  const filteredReport = [];
  report.forEach((item) => {
    const WI = Number(item.description);
    if (isNaN(WI)) {
      console.log(
        chalk.red(`Ignoring task (not a number): ${item.description}`)
      );
      return;
    }
    console.log(
      chalk.green(
        `Found task ${chalk.bgBlue(`#${WI}`)} with ${chalk.bgBlue(
          item.hours
        )} hours`
      )
    );
    filteredReport.push({ WI, hours: Number(item.hours) });
  });

  await confirmContinue();

  const { organization } = await inquirer.prompt({
    name: "organization",
    type: "input",
    message: "Enter your Azure DevOps organization:",
  });

  const { userToken } = await inquirer.prompt({
    name: "userToken",
    type: "input",
    message: "Enter your Azure DevOps token from UserAuthentication cookie:",
  });
  const authHeaders = buildAuthHeaders(userToken);

  const WIs = [];

  for (let item of filteredReport) {
    const spinner = createSpinner(`Reading work item ${item.WI}`).start();
    const WIResponse = await axios
      .get(
        `https://dev.azure.com/${organization}/_apis/wit/workitems/${item.WI}?api-version=6.1`,
        {
          headers: {
            ...authHeaders,
          },
        }
      )
      .catch(() => {});

    const completedWork =
      WIResponse?.data?.fields?.["Microsoft.VSTS.Scheduling.CompletedWork"] ??
      0;
    const name = WIResponse?.data?.fields?.["System.Title"];

    if (!WIResponse || !name) {
      spinner.error({ text: `Error reading work item ${item.WI}` });
      continue;
    }

    const newHours = Math.floor(completedWork * 100 + item.hours * 100) / 100;
    spinner.success({
      text: `Work item ${chalk.yellow(
        `#${item.WI} (${name})`
      )} read. Current completed hours: ${chalk.yellow(
        completedWork
      )}. Hours from report ${chalk.blue(
        item.hours
      )}. New completed hours will be: ${chalk.green(newHours)}.`,
    });
    WIs.push({
      id: item.WI,
      completedWork,
      hours: item.hours,
      newHours,
      name,
    });
  }

  await confirmContinue();

  for (let item of WIs) {
    const spinner = createSpinner(
      `Patching work item ${chalk.yellow(
        `#${item.id} (${item.name})`
      )}. New hours: ${chalk.green(item.newHours)}.`
    ).start();
    const patchResponse = await axios
      .patch(
        `https://dev.azure.com/${organization}/_apis/wit/workitems/${item.id}?api-version=6.1`,
        [
          {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.CompletedWork",
            value: item.newHours.toString(),
          },
        ],
        {
          headers: {
            ...authHeaders,
            "Content-Type": "application/json-patch+json",
          },
        }
      )
      .catch(() => {});

    const newHours =
      patchResponse?.data?.fields?.["Microsoft.VSTS.Scheduling.CompletedWork"];

    if (!patchResponse || !newHours) {
      spinner.error({
        text: chalk.red(
          `Error patching work item ${chalk.yellow(`#${item.id}`)}.`
        ),
      });
      continue;
    }

    spinner.success({
      text: chalk.green(
        `Work item ${chalk.yellow(
          `#${item.id} (${item.name})`
        )} patched. New hours: ${chalk.green(newHours)}.`
      ),
    });
  }
})();
