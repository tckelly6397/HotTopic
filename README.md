# HotTopic

## Overview
**HotTopic** is a project developed for CSE 368, focused on predicting future weather patterns over incredibly long time frames—think decades or even centuries. Our goal is to leverage advanced AI models and an AWS-powered backend to provide accurate, long-term weather forecasts based on specific geographic locations.

## How to Contribute
To contribute to the project, follow these steps:

1. Clone the repository and initialize Git:
   ```bash
   git init
   git remote add origin https://github.com/tckelly6397/HotTopic.git
   git branch -M main
   ```

2. When working on a new feature or bug fix, always create a new branch:
   ```bash
   git checkout -b feature-branch-name
   ```

3. After making changes, commit and push to your branch:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin feature-branch-name
   ```

## Project Structure
Here's a breakdown of our project directory:

- `/deployment` — Contains all deployment-related code, including configuration files and scripts for setting up the AWS environment.
- `/src` — Houses the static HTML content and other frontend resources for the project.

## Future Plans
Our project will eventually integrate a full AWS architecture to handle backend data processing, storage, and API interactions. We'll be using a combination of AWS services such as Lambda, S3, and possibly machine learning services like SageMaker to develop the forecasting model.

---
