# Campaign Manager

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Campaign Display</title>
</head>
<body>
  <div id="campaignContainer"></div>

  <script>
    function initCampaign(campaignContainer, campaignId) {
      fetch('http://localhost:3000/') // Fetch the handleCampaign function from the server
        .then(response => response.text())
        .then(handleCampaignFunction => {
          eval(handleCampaignFunction); // Evaluate the received handleCampaign function
          // Use handleCampaign function to display a campaign
          handleCampaign(campaignContainer, campaignId);
        })
        .catch(error => {
          console.error('Error fetching handleCampaign function:', error);
        });
    }

    // Call initCampaign to render the campaign with ID 1 in the specified container
    initCampaign('campaignContainer', 3); // Replace '1' with the desired campaign ID
  </script>
</body>
</html>
```

**For the demo, create an html file, copy the above html into it and open in the browser.**
