/* src/App.js */
import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { List, Container, ListItem, ListItemText, ListItemIcon, Card, TextField, Button, FormGroup, FormControl, Input, IconButton, Grid, Checkbox, AppBar, Typography, Toolbar, Paper } from "@material-ui/core"
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
	root: {

	},
	form: {
		// display: "flex",
		// justifyContent: "space-between",
	},
	addBtn: {

	},
	content: {
		// flexGrow: 1
		// margin: theme.spacing(1),
		width: '100%'
	},
	title: {
		// margin: theme.spacing(1),
	},
	done: {
		textDecoration: "line-through"
	}
}));

const initialState = { name: "", description: "" };

const App = () => {
	const [formState, setFormState] = useState(initialState);
	const [todos, setTodos] = useState([]);
	const classes = useStyles();

	useEffect(() => {
		fetchTodos();
	}, []);

	const setInput = (key, value) => {
		setFormState({ ...formState, [key]: value });
	};

	const fetchTodos = async () => {
		try {
			const todoData = await API.graphql(graphqlOperation(listTodos));
			const todos = todoData.data.listTodos.items;
			setTodos(todos);
		} catch (err) {
			console.log("error fetching todos");
		}
	};

	const addTodo = async () => {
		try {
			if (!formState.name) return;
			const todo = { ...formState, done: false };
			setFormState(initialState);
			await API.graphql(graphqlOperation(createTodo, { input: todo }));
			fetchTodos();
		} catch (err) {
			console.log("error creating todo:", err);
		}
	};

	const removeTodo = (todo) => async () => {
		try {
			if (!todo) return;
			// setTodos([...todos.splice(todos.indexOf(todo), 1)]);
			await API.graphql(graphqlOperation(deleteTodo, { input: { id: todo.id } }));
			fetchTodos();
		} catch (err) {
			console.log("error deleting todo:", err);
		}
	};

	const toggleCompleteTodo = (todo) => async () => {
		try {
			if (!todo) return;
			await API.graphql(graphqlOperation(updateTodo, { input: { id: todo.id, done: !todo.done } }));
			fetchTodos();
		} catch (err) {
			console.log("error deleting todo:", err);
		}
	}


	return (
		<Container>
			<Paper>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h6" className={classes.title}>
							My Todo
					</Typography>
					</Toolbar>
				</AppBar>
				<List>
					<ListItem className={classes.form} >
						<Grid container spacing={3}>
							<Grid item xs={11}>
								<TextField
									className={classes.content}
									onChange={(event) => setInput("name", event.target.value)}
									value={formState.name}
									// placeholder="Content"
									multiline
								// variant="outlined"
								/>
							</Grid>
							<Grid item xs={1}>
								<Button
									color="primary"
									className={classes.addBtn}
									onClick={addTodo}
									variant="contained"
								>
									Save</Button>
							</Grid>

						</Grid>
					</ListItem>
					{todos.map((todo, index) => (
						<ListItem key={todo.id ? todo.id : index} onClick={toggleCompleteTodo(todo)} button >
							<ListItemText className={todo.done ? classes.done : ""} >{todo.name}</ListItemText>
							<IconButton
								edge="end"
								aria-label="comments"
								onClick={removeTodo(todo)}
							>
								<DeleteIcon />
							</IconButton>
						</ListItem>
					))}
				</List>
			</Paper>
		</Container>
	);
};


export default App;
