//Creative Coding (DM-GY-6063-B) Fall 2016 FINAL PROJECT 
//TITLE: HOME IS WHERE THE HEART IS | AUTHOR: ANKIT RUHELA
//This project demonstrates evolution of code through machine learning that uses a genetic algorithm to spawn phenotypes
//with higher fitness rates by a constant rate of mutation everytime and therefore better understanding the path the birds
//have to take to reach their nest.

//global variables
var population;
var lifespan = 500;
var lifeP;
var count = 0;
var nestTarget;
var maxforce = 0.4;
var nest;
var birdie;

var rx = 350;
var ry = 300;
var rw = 300;
var rh = 20;

//preload function to load images into the sketch in async fashion
function preload() {
  nest = loadImage("assets/nest.png");
  birdie = loadImage("assets/bird.png");
}

function setup() {
  createCanvas(1000, 600); //create canvas
  bird = new Bird();  //initializing the Bird function into an object
  population = new Population(); //initializing the Population function into an object
  lifeP = createP(); //creating a paragraph element
  //create a 2D vector, to initialize x and y values for the nest
  nestTarget = createVector(width/2, 50);

}

function draw() {
  //set background color
  background(109, 138, 255);
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
  rect(rx, ry, rw, rh);
  //initializing the nest where the birds have to reach; the target!
  imageMode(CENTER);
  image(nest, nestTarget.x, nestTarget.y, 50, 25);
}

//---POPULATION CLASS---
//this class creates the population of birds after each population's lifespan
//based on the parents' genes, and therefore sending the most fit out of the previous
//population to the next round of population thereby generating a more fit population
//lifespan after lifespan.

function Population() {
  this.birds = [];
  this.popsize = 25;
  this.matingpool = [];

  for (var i = 0; i < this.popsize; i++) {
    this.birds[i] = new Bird();
  }

//evaluate function. this function evaluates the fitness value of each phenotype and places them in a mating pool.
//higher the fitness rate, higher the chances of that bird to make it to the nest.

  this.evaluate = function() {

    var maxfit = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].calcFitness();
      if (this.birds[i].fitness > maxfit) {
        maxfit = this.birds[i].fitness;
      }
    }
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].fitness /= maxfit;
    }

    this.matingpool = [];
    for (var i = 0; i < this.popsize; i++) {
      var n = this.birds[i].fitness * 100;
      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.birds[i]);
      }
    }
  }
  
  //selection function. this function selects on the basis of the availability of the mating pool, which genes have higher 
  //fitness rate values, and selects them to produce a new bird when a new generation is spawned

  this.selection = function() {
    var newBirds = [];
    for (var i = 0; i < this.birds.length; i++) {
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      var child = parentA.crossover(parentB);
      child.mutation();
      newBirds[i] = new Bird(child);
    }
    this.birds = newBirds;
  }
  
  //run function updates and shows the bird population on the canvas

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
    this.genes = [];
    for (var i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxforce);
    }
  }

//crossover function that details that what genes from which parent crosses over to produce a child. 
//the genes array is split from the mid point; which in turn is chosen randomly

  this.crossover = function(partner) {
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for (var i = 0; i < this.genes.length; i++) {
      if (i > mid) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  }
  
  //mutation function. this function sets a 1% mutation rate for the genes to develop over time by taking 
  //genetic information from the parents' genes

  this.mutation = function() {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }

}

//---BIRD CLASS---
//this class is responsible for spawning new generations of birds
//on the basis of information recieved by the DNA function and the population
//class and then uses a basic physics engine schematic that uses vectors
//to allow them to be displayed in the sketch

function Bird(dna) {
  this.pos = createVector(width / 2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.reached = false;
  this.dead = false;
  
  //If there is dna information already availabl in the array, then keep it, if not create a new instance of DNA

  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  
  //set fitness score to zero
  this.fitness = 0;

  this.applyForce = function(force) {
    this.acc.add(force);
  }

//calculating fitness. if the bird reaches the nest, increase the fitness value, if the bird dies elsewhere
//decrease the fitness value.

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
    
  //placing IF statements for the birds to stop moving when they have reached the target
    if (d < 10) {
      this.reached = true;
      this.pos = nestTarget.copy();
    }
    
  //placing IF statements so that the birds do not go out of the canvas boundaries, if they hit the boundary, they die.

    if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
      this.dead = true;
    }

    if (this.pos.x > width || this.pos.x < 0) {
      this.dead = true;
    }
    if (this.pos.y > height || this.pos.y < 0) {
      this.dead = true;
    }

//basic force values for the birds to move around the canvas

    this.applyForce(this.dna.genes[count]);
    if (!this.reached && !this.dead) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  }

//function to display the bird

  this.show = function() {
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    imageMode(CENTER);
    push();
    rotate(20);
    image(birdie, 0, 0, 30, 15);
    pop();
    pop();
  }

}
