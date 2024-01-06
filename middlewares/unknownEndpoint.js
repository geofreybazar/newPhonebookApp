export default function unknownEndpoint(_, res) {
    return res.status(404).send({error: "unknown Endpoint"});
};
