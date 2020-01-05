import authors from './data/authors';
import publishers from './data/publishers';
import {ApolloServer, gql} from 'apollo-server';

const typeDefs = gql`
    type Author {
        id: String
        name: String
    }
    
    type Publisher {
        id: String
        name: String
    }
    
    type Query {
        authors(ids: [String]): [Author]
        publishers(ids: [String]): [Publisher]
    }
`;

const resolvers = {
    Query: {
        authors: (root, {ids = []}) => {
            if (ids.length === 0) {
                return authors;
            }

            return authors.filter(({id}) => ids.includes(id));
        },
        publishers: (root, {ids = []}) => {
            if (ids.length === 0) {
                return publishers;
            }

            return publishers.filter(({id}) => ids.includes(id));
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({port: 4000}).then(({ url }) => {
    console.log(`🚀  Books info server ready at ${url}`);
});
