//global variables
var bird;
var birds;
var population;
var lifespan = 400;
var lifeP;
var count = 0;
var nest;
var nestTarget;
var obsx = 300;
var obsY = 300;
var obsW = 300;
var obsH = 20;
var maxForce = 0.2;


//preload function to load images into the sketch in async fashion
function preload() {

	bird = loadImage("assets/bird.png"); //bird image
	nest = loadImage("assets/nest.png"); //nest image
	//create a 2D vector, to initialize x and y values for the nest
	nestTarget = createVector(width/2, 50);
}

function setup() {
  createCanvas (1000, 600); //create canvas
  	birds = new Birds(); //initializing the Birds function into an object
  	population = new Population(); //initializing the Population function into an object
  	lifeP = createP(); //creating a paragraph element
}

function draw() {

	//set bg color
	background(0);
	//initializing the nest where the birds have to reach; the target!
	image(nest, nestTarget.x, nestTarget.y, 100, 50);
	//initialize the population of birds
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

    fill(102, 65, 5);
    rect(obsX, obsY, obsW, obsH);

}

//---POPULATION FUNCTION---
//this function creates the population of birds after each population's lifespan
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
		for (var i =0; i < this.popsize; i++) {
			this.birds[i].update();
			this.birds[i].show();
		}

	}

}

//---DNA FUNCTION---
//this function takes the information stored in the genes array that
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

//---BIRDS FUNCTION---
//this function is responsible for spawning new generations of birds
//on the basis of information recieved by the DNA function and the population
//function and then uses a basic physics engine schematic that uses vectors
//to allow them to be displayed in the sketch

function Birds(dna) {

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
		var d = dist(this.pos.x, this.pos.y, nestTarget.x, nestTarget.y);
		this.fitness = map(d, 0, width, width, 0);
		if (this.reached) {
			this.fitness *= 10;
		}
		if (this.dead) {
			this.fitness /= 10;
		}
	}

	this.update = function() {
		var d = dist(this.pos.x, this.pos.y, nestTarget.x, nestTarget.y);
		if (d < 10){
			this.reached = true;
			this.pos = nestTarget.copy();
		}

		if (this.pos.x > obsX && this.pos.x < obsX + obsW && this.pos.y > obsY && this.pos.y < obsY + obsH) {

			this.dead = true;
		}

		if (this.pos.x > width || this.pos.x < 0) {
			this.dead = true;
		}

		if (this.pos.y > height || this.pos.y < 0) {
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
}