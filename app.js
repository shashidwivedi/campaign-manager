const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
app.use(express.json());
app.use(cors());

const campaignsFilePath = path.join(__dirname, 'campaigns.json');
const campaignLikesFilePath = path.join(__dirname, 'campaignLikes.json');

console.log(campaignsFilePath);
console.log(campaignLikesFilePath);

// Endpoint: Retrieve all campaigns
app.get('/campaigns', async (req, res) => {
    try {
        const campaignsData = await fs.readFile(campaignsFilePath);
        const campaigns = JSON.parse(campaignsData);
        res.json(campaigns);
    } catch (error) {
        res.status(500).send('Error retrieving campaigns');
    }
});

// Endpoint: Retrieve campaign by ID
app.get('/campaigns/:id', async (req, res) => {
    try {
        const campaignsData = await fs.readFile(campaignsFilePath);
        const campaigns = JSON.parse(campaignsData);
        const id = parseInt(req.params.id);
        const campaign = campaigns.find(campaign => campaign.id === id);
        if (campaign) {
            res.json(campaign);
        } else {
            res.status(404).send('Campaign not found');
        }
    } catch (error) {
        res.status(500).send('Error retrieving campaign');
    }
});

// Endpoint: Like a campaign by ID
app.post('/campaigns/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body || { userId: 1 }; // Use provided userId or default to 1
        const action = req.query.action === 'unliked' ? 'unliked' : 'liked';
        const timestamp = new Date().toISOString(); // Current timestamp

        const likesData = await fs.readFile(campaignLikesFilePath);
        const campaignLikes = JSON.parse(likesData);

        campaignLikes.push({ campaignId: id, action, userId, timestamp });

        await fs.writeFile(campaignLikesFilePath, JSON.stringify(campaignLikes, null, 2));

        res.send(`Campaign with ID ${id} is ${action} by User ${userId} at ${timestamp}`);
    } catch (error) {
        res.status(500).send('Error liking campaign');
    }
});

// Root endpoint: Generate campaign handling function by campaign ID
app.get('/', (req, res) => {
    const handleCampaign = `
        function handleCampaign(campaignContainer, campaignId) {
            fetch("http://localhost:3000/campaigns/" + campaignId) // Fetch campaign data
                .then(response => response.json())
                .then(campaign => {
                    const container = document.getElementById(campaignContainer);
                    if (container) {
                        container.innerHTML = \`
                            <div style="position: relative; text-align: center;">
                                <img src="\${campaign.image}" alt="\${campaign.title}" style="display: block; margin: 0 auto;">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.5); padding: 10px; border-radius: 5px;">
                                    <h2 style="color: white; margin: 0;">\${campaign.title}</h2>
                                    <button id="likeButton" style="margin-top: 10px; color: white; background-color: #3498db; border: none; padding: 8px 16px; border-radius: 5px;">Like</button>
                                </div>
                            </div>
                        \`;

                        // Add event listener for the 'Like' button
                        const likeButton = document.getElementById('likeButton');
                        likeButton.addEventListener('click', function() {
                            const action = likeButton.textContent === 'Like' ? 'liked' : 'unliked';
                            fetch("http://localhost:3000/campaigns/" + campaignId + "/like?action=" + action, {
                                method: 'POST',
                            })
                            .then(response => response.text())
                            .then(message => {
                                console.log(message); // Log the response from the server
                                likeButton.textContent = action === 'liked' ? 'Unlike' : 'Like';
                            })
                            .catch(error => {
                                console.error('Error liking campaign:', error);
                            });
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching campaign:', error);
                });
        }
    `;
    res.header('Content-Type', 'application/javascript').send(handleCampaign);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
