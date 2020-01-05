import fetch from 'node-fetch';
import books from './data/books';
import {ApolloServer, gql} from 'apollo-server';
import {HttpLink} from 'apollo-link-http';
import {execute, GraphQLRequest, FetchResult} from 'apollo-link';

interface GraphqlLink {
    execute(operation: GraphQLRequest): Promise<FetchResult>;
}

const typeDefs = gql`
    type Author {
        id: String
        name: String
    }
    
    type Publisher {
        id: String
        name: String
    }
    
    type Book {
        id: String
        name: String
        author: Author
        publisher: Publisher
    }
    
    type Query {
        books(ids: [String]): [Book]
    }
`;

const booksInfoQuery = gql`
    query booksInfo($ids: [String]) {
        authors(ids: $ids) {
            id
            name
        }
        publishers(ids: $ids) {
            id
            name
        }
    }
`;

const resolvers = {
    Query: {
        books: async (root, {ids = []}, {booksInfoLink}) => {
            const {authors, publishers} = await booksInfoLink.execute({
                query: booksInfoQuery,
                variables: {ids},
            });

            return books
                .filter(({id}) =>ids.length > 0 ? ids.includes(id) : true )
                .map(({id, name}) => ({
                    id,
                    name,
                    author: authors.find(author => author.id === id),
                    publisher: publishers.find(publisher => publisher.id === id),
                }))
        },
    }
};

function createGraphqlLink(uri: string): GraphqlLink {
    const link = new HttpLink({uri, fetch: fetch as any});

    return {
        execute(operation: GraphQLRequest): Promise<FetchResult> {
            return new Promise<FetchResult>((resolve, reject) => {
                execute(link, operation).subscribe(({data}) => resolve(data), reject);
            });
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
        booksInfoLink: createGraphqlLink('http://localhost:4000/graphql'),
    }),
});

server.listen({port: 3000}).then(({ url }) => {
    console.log(`🚀  Books server ready at ${url}`);
});
