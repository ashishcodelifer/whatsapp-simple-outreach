# Map collector

This is a user-initiated Chrome extension for the dashboard. Load the `map-collector` folder at `chrome://extensions` with Developer mode enabled, open a Google Maps search such as `restaurants in Patna`, and click **Collect results** in the floating panel.

It scrolls the visible results panel, extracts business names, result URLs, visible phone numbers, and external websites, then sends each record to the Render `/api/leads` endpoint. Duplicate records are rejected by the backend.

The collector does not send WhatsApp messages. The dashboard's **Send** button opens a `wa.me` URL with the typed message, leaving the final send action to the user.

Use only on sites and data you are authorized to collect. Google Maps markup can change, so selectors may need maintenance.
