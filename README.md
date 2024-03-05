# Microsoft Teams Notifications for Adobe Cloud Manager Pipeline (Cloudfare Worker)
This webhook on [Cloudfare Workers](https://developers.cloudflare.com/workers/) allows you to send Adobe Cloud Manager CI/CD Pipeline Notifications to Microsoft Teams. You can use it to post and monitor the status of your Cloud Manager deployment pipeline without having to log in to Cloud Manager.


## Sample Notifications in Action
The different types of notifications and how they appear in Microsoft Teams are presented below. Each notification lists the existing pipeline steps and their current status so that the overall progress of the deployment can be tracked using the most recent message. In addition, each message has a button that allows anyone with Cloud Manager access to access the details of the pipeline execution in Cloud Manager.

### Pipeline Started Notification

![Pipeline Started][screenshot-pipeline-started]

### Execution Step Started Notification

![Execution Step Started][screenshot-step-started]

### Execution Step Ended Notification

![Execution Step Ended][screenshot-step-ended]

### Pipeline Ended Notification

![Pipeline Ended][screenshot-pipeline-ended]



## Getting Started

Below you will find instructions for local setup.

### Prerequisites

1. Before you can start, you must first set up a project in the [Adobe Developer Console][Adobe-Developer-Console-url]. First, follow the instructions on the [Create an API Integration](https://developer.adobe.com/experience-cloud/cloud-manager/guides/getting-started/create-api-integration/) section to create an API integration. The Event Integration will be added in a later step.
2. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages). It's also recommended to complete the [Get started guide](https://developers.cloudflare.com/workers/get-started/guide/).
3. Install [Node.js](https://nodejs.org/en) (>=16.17.0) and npm, the Node Package Manager.

### Configuration Secrets
  ```
  ORGANIZATION_ID=
  CLIENT_ID=
  CLIENT_SECRET=
  TEAMS_WEBHOOK=
  CM_PIPELINE_EXECUTION_BASE_URL=
  ```
1. `ORGANIZATION_ID` -- this can be found in the Credentials details section of the Adobe Developer Console.
2. `CLIENT_ID` -- this can be found in the Credentials details section of the Adobe Developer Console.
3. `CLIENT_SECRET` -- this can be found in the Credentials details section of the Adobe Developer Console.
4. `TEAMS_WEBHOOK` -- this is the incoming webhook URL for Microsoft Teams. Documentation to create a webhook URL for Microsoft Teams can be found [here](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook).
5. `CM_PIPELINE_EXECUTION_BASE_URL` -- this is the basic URL to the details of the pipeline execution in Cloud Manager, e.g. `https://experience.adobe.com/#/@myprogram/cloud-manager/pipelineexecution.html`. Replace `myprogram` in the URL with the proper program name.

#### Secrets in development

Populate the file `.dev.vars` in the root of the project to define the above secrets that will be available to the Worker when running it locally.

#### Secrets on deployed Workers

Documentation to add / update secrets on a deployed worker can be found [here](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers).


### Running the Worker

1. Run the worker on local port
   ```sh
   node start
   ```
2. In order to use the worker with Adobe I/O, it must be accessible to the public internet.
   ```sh
   node deploy
   ```
3. Open the [Adobe Developer Console][Adobe-Developer-Console-url] and open the Project you created in the Prerequisites section. Click `Add to Project` and select `Event`. Select `Cloud Manager Events` and click `Next`. Select the events you want to subscribe to. Click the `Next` button. For receiving events select the `Webhook` option. The Webhook URL will be the Cloudfare Worker URL appended with `/webhook`, e.g. `https://worker.user.workers.dev/webhook`
4. Once a pipeline execution is triggered in Cloud Manager, the subscribed Cloud Manager Events are sent to the webhook which then posts a message to Microsoft Teams.



<!-- LICENSE -->
## License

Distributed under the MIT License. See [LICENSE](LICENSE.txt) for more information.



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[screenshot-pipeline-started]: images/pipeline_started.png
[screenshot-pipeline-ended]: images/pipeline_ended.png
[screenshot-step-started]: images/step_started.png
[screenshot-step-ended]: images/step_ended.png
[Adobe-Developer-Console-url]: https://developer.adobe.com/console/projects
