//Creative Coding (DM-GY-6063-B) Fall 2016 FINAL PROJECT 
//TITLE: HOME IS WHERE THE HEART IS | AUTHOR: ANKIT RUHELA
//This project demonstrates evolution of code through machine learning that uses a genetic algorithm to spawn phenotypes
//with higher fitness rates by a constant rate of mutation everytime and therefore better understanding the path the birds
//have to take to reach their nest.

//global variables
var bird;
var birds;
var population;
var lifespan = 400;
var lifeP;
var count = 0;
var nest;
var nestTarget;
var obsX = 300;
var obsY = 300;
var obsW = 300;
var obsH = 20;
var maxForce = 0.2;
var canWidth = 1000;
var canHeight = 600;


//preload function to load images into the sketch in async fashion
function preload() {

	bird = loadImage("assets/bird.png"); //bird image
	nest = loadImage("assets/nest.png"); //nest image
	//create a 2D vector, to initialize x and y values for the nest
	nestTarget = createVector(canHeight/2, 100);
}

function setup() {
  createCanvas (canWidth, canHeight); //create canvas
  	birds = new Birds(); //initializing the Birds function into an object
  	population = new Population(); //initializing the Population function into an object
  	lifeP = createP(); //creating a paragraph element
}

function draw() {

	//set bg color
	background(109, 138, 255);
	//initializing the nest where the birds have to reach; the target!
	image(nest, nestTarget.x, nestTarget.y, 50, 25);
	//initialize the population of birds
	fill(102, 65, 5);
    rect(obsX, obsY, obsW, obsH);
    population.run();
    //calling the paragraph element to display the count value
    lifeP.html(count);
    count++;

    //reset the count to 0; generate a new population that has a higher fitness rate
    if (count == lifespan) {
    	population.evaluate();
    	population.selection();
    	count = 0;
    }


}

//---POPULATION CLASS---
//this class creates the population of birds after each population's lifespan
//based on the parents' genes, and therefore sending the most fit out of the previous
//population to the next round of population thereby generating a more fit population
//lifespan after lifespan.

function Population() {

	this.birds = [];
	this.popsize = 25;
	this.matingPool = [];

	for (var i =0; i < this.popsize; i++) {
		this.birds[i] = new Birds();
		}

	this.evaluate = function() {

			var maxfit = 0;
			for (var i =0; i < this.popsize; i++) {
				this.birds[i].calcFitness();
				if ( this.birds[i].fitness > maxfit) {
					maxfit = this.birds[i].fitness;
				}
			}
			console.log(this.birds);;

			for (var i =0; i < this.popsize; i++) {
				this.birds[i].fitness /= maxfit;
			}

			this.matingPool = [];
			for (var i =0; i < this.popsize; i++) {
				var n = this.birds[i].fitness * 100;
				for (var j = 0; j < n; j++){
					this.matingPool.push(this.birds[i]);
				}
			}
	}
	this.selection = function() {
		var newBirds = [];
		for (var i = 0; i < birds.length; i++) {
		var parentA = random(this.matingPool).dna;
		var parentB = random(this.matingPool).dna;
		var child = parentA.crossover(parentB);
		child.mutation();
		newBirds[i] = new Birds(child);
		}

		this.birds = newBirds;
	}
	this.run = function() {
		for (var i = 0; i < this.popsize; i++) {
			this.birds[i].update();
			this.birds[i].show();
		}
	}
}

//---DNA CLASS---
//this class takes the information stored in the genes array that
//acts as a DNA strand, and on that basis, helps perform crossover
//or mutation for the phenotypes to be produced

function DNA(genes) {
	if (genes) {
		this.genes = genes;
	} else {
	this.genes = []; //initialize the genes array
	for (var i = 0; i < lifespan; i++) {
		this.genes[i] = p5.Vector.random2D();
		this.genes[i].setMag(maxForce); 
	}
	}

	this.crossover = function (partner) {
		var newGenes = [];
		var midPoint = floor(random(this.genes.length));
		for (var i =0; i< this.genes.length; i++){
			if (i> midPoint) {
				newGenes[i] = this.genes[i];
			} else {
				newGenes[i] = partner.genes[i];
			}
		}
		return new DNA(newGenes);
	}

	this.mutation = function() {

		for (var i=0; i < this.genes.length; i++) {

			if(random(1) < 0.01) {
				this.genes[i] = p5.Vector.random2D();
				this.genes[i] = setMag(maxForce);
			}
		}
	}
}
//---BIRDS CLASS---
//this class is responsible for spawning new generations of birds
//on the basis of information recieved by the DNA function and the population
//class and then uses a basic physics engine schematic that uses vectors
//to allow them to be displayed in the sketch
function Birds(dna) {

	var obsX = 300;
	var obsY = 300;
	var obsW = 300;
	var obsH = 20;

	this.position = createVector(width/2, height);
	this.velocity = createVector();
	this.acceleration = createVector();
	this.reached = false;
	this.dead = false;
	if (dna) {
		this.dna = dna;
	} else {
	this.dna = new DNA();
	}

	this.fitness = 0;

	this.applyForce = function(force) {

		this.acceleration.add(force);
	}

	this.calcFitness = function() {
		var d = dist(this.position.x, this.position.y, nestTarget.x, nestTarget.y);
		this.fitness = map(d, 0, width, width, 0);
		if (this.reached) {
			this.fitness *= 10;
		}
		if (this.dead) {
			this.fitness /= 10;
		}
	}

	this.update = function() {

		//code to check if the birds hit the obstacle, if they hit the obstacle, they die.
		var d = dist(this.position.x, this.position.y, nestTarget.x, nestTarget.y);
		if (d < 10){
			this.reached = true;
			this.position = nestTarget.copy();
		}

		if (this.position.x > this.obsX && this.position.x < this.obsX + this.obsW && this.position.y > this.obsY && this.position.y < this.obsY + this.obsH) {

			this.dead = true;
		}

		//placing IF statements so that the birds do not go out of the canvas boundaries, if they hit the boundary, they die.

		if (this.position.x > width || this.position.x < 0) {
			this.dead = true;
		}

		if (this.position.y > height || this.position.y < 0) {
			this.dead = true;
		}

		this.applyForce(this.dna.genes[count]);
		if (!this.reached && !this.dead) {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
		this.velocity.limit(4);
		}
	}

	this.show = function() {

		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());
		imageMode(CENTER);
		push();
		rotate(20);
		image(bird, 0, 0, 30, 15);
		pop();
		pop();
	}
}
