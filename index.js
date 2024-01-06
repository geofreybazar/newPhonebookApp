import config from "./utils/config.js"
import app from "./app.js";

const PORT = config.PORT || 3001;

app.get("/", (_req,res) => {
     res.send("<h1>Hello JS</h1>");
});

app.listen(PORT, () => {
    console.log('Server is Running on PORT 3001')
});
