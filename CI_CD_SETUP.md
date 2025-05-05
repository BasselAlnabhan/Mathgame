# CI/CD Setup Guide

This guide will help you set up Continuous Integration and Continuous Deployment for the Math Monster Game using GitHub Actions and Netlify.

## GitHub Actions Setup

The project includes a GitHub Actions workflow file (`.github/workflows/test-and-deploy.yml`) that automatically:

1. Runs tests on every push to main/master branch and every pull request
2. Deploys the game to Netlify when changes are pushed to the main/master branch

### How it works

The GitHub Actions workflow has two main jobs:

1. **Test Job**: Runs the test suite to verify that the code is working correctly
2. **Deploy Job**: Builds the project and deploys it to Netlify (only on pushes to main/master)

## Netlify Setup

To configure your Netlify deployment:

1. Create an account on [Netlify](https://www.netlify.com/)
2. Create a new site by importing your GitHub repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Obtain Netlify Tokens

To enable GitHub Actions to deploy to Netlify, you need to set up two secrets in your GitHub repository:

1. **NETLIFY_AUTH_TOKEN**:

   - Go to Netlify User Settings → Applications → Personal access tokens
   - Create a new personal access token
   - Copy the token value

2. **NETLIFY_SITE_ID**:
   - Go to your Netlify site settings
   - Find your Site ID in the Site information section

## Setting up GitHub Secrets

Add the Netlify tokens as secrets in your GitHub repository:

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - Name: `NETLIFY_AUTH_TOKEN`, Value: (your Netlify auth token)
   - Name: `NETLIFY_SITE_ID`, Value: (your Netlify site ID)

## Testing the CI/CD Pipeline

Once you've set up the GitHub Actions workflow and added the required secrets:

1. Make a change to your code
2. Commit and push to your main/master branch
3. Go to the "Actions" tab in your GitHub repository to see the workflow running
4. Once complete, your site should be deployed to Netlify

## Custom Domains (Optional)

To set up a custom domain for your Netlify site:

1. Go to your Netlify site settings
2. Click on "Domain settings"
3. Click "Add custom domain"
4. Follow the instructions to configure your DNS settings

## Troubleshooting

If your deployment fails:

1. Check the GitHub Actions logs for specific error messages
2. Verify that the NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID are correctly set
3. Ensure that your build process works locally by running `npm run build`
4. Check if your Netlify configuration (`netlify.toml`) is correct

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Actions for Netlify](https://github.com/nwtgck/actions-netlify)
