export default function getTokenFrom(req) {
    const authorization = req.get("authorization");
  
    if (authorization && authorization.startsWith("Bearer ")) {
      return authorization.replace("Bearer ", "");
    }
  
    return null;
  }
  