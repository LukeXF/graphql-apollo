const graphql = require('graphql');
const axios = require('axios')

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList
} = graphql;

// const users = [
// 	{ id: '23', firstName: 'Bill', age: 20},
// 	{ id: '47', firstName: 'Samantha', age: 21},
// ];

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: () => ({
		// function returns an object that is defined but doesn't run until end of file
		// closure scopes allow circular references
		id: {type: GraphQLString},
		name: {type: GraphQLString},
		description: {type: GraphQLString},
		users: {
			type: new GraphQLList(UserType),
			resolve(parentValue, args) {
				console.log('parent', parentValue);
				return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
					.then(resp => resp.data)
				// console.log(parentValue, args);
			}
		}
	})
});

// instructs what properties it should have
// user model is data from JSON API
// user type is the an GraphQL object type
const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: {type: GraphQLString},
		firstName: {type: GraphQLString},
		age: {type: GraphQLInt},
		company: { // nested query
			type: UserType,
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
					.then(resp => resp.data)
				// console.log(parentValue, args);
			}
		}
	})
});

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: {
				id: {type: GraphQLString}
			},
			resolve(parentValue, args) {
				// return _.find(users, { id: args.id });
				return axios.get(`http://localhost:3000/users/${args.id}`)
					.then(resp => resp.data)
			}
		},
		company: {
			type: CompanyType,
			args: {
				id: {type: GraphQLString}
			},
			resolve(parentValue, args) {
				console.log(args);
				return axios.get(`http://localhost:3000/companies/${args.id}`)
					.then(resp => resp.data)
			}
		}

	}
});

module.exports = new GraphQLSchema({
	query: RootQuery
});
