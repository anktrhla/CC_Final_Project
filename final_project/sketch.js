//Creative Coding (DM-GY-6063-B) Fall 2016 FINAL PROJECT 
//TITLE: HOME IS WHERE THE HEART IS | AUTHOR: ANKIT RUHELA
//This project demonstrates evolution of code through machine learning that uses a genetic algorithm to spawn phenotypes
//with higher fitness rates by a constant rate of mutation everytime and therefore better understanding the path the birds
//have to take to reach their nest.

//---References---
//BIG THANKS TO DANIEL SHIFFMAN
//The Nature of Code, Ch-9: The Evolution of Code (http://natureofcode.com/book/chapter-9-the-evolution-of-code/)
//Daniel Shiffman's YouTube Playlist on Nature of Code, 9: Genetic Algorithms - The Nature of Code
//(https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bJM3VgzjNV5YxVxUwzALHV)

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
  //fill brown color in the rectangle
  fill(102, 65, 5);
  //create rectangle
  rect(rx, ry, rw, rh);
  //initializing the nest where the birds have to reach; the target!
  //set image's pivot point to the center
  imageMode(CENTER);
  //call in the nest image
  image(nest, nestTarget.x, nestTarget.y, 50, 25);
}

//---POPULATION CLASS---
//this class creates the population of birds after each population's lifespan
//based on the parents' genes, and therefore sending the most fit out of the previous
//population to the next round of population thereby generating a more fit population
//lifespan after lifespan.

function Population() {
  //create an empty birds array
  this.birds = [];
  //set the population size for the birds to spawn
  this.popsize = 25;
  //create an empty array for the mating pool
  this.matingpool = [];
//initializing birds array for the population size of the birds
  for (var i = 0; i < this.popsize; i++) {
    this.birds[i] = new Bird();
  }

//evaluate function. this function evaluates the fitness value of each phenotype and places them in a mating pool.
//higher the fitness rate, higher the chances of that bird to make it to the nest.

  this.evaluate = function() {
    
//set initial value for the maximum fitness a progeny can achieve
    var maxfit = 0;
    //for loop to calculate the fitness values of the progeny
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].calcFitness();
      //the if statement stores the fitness value for each bird in the array as the new maximum fitness value
      if (this.birds[i].fitness > maxfit) {
        maxfit = this.birds[i].fitness;
      }
    }
    //for loop that divides the fitness value of reach bird in the array by the maxfit value
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].fitness /= maxfit;
    }
  //for loop to multiply the fitness value by 100 to make it relatable in percentages
    this.matingpool = [];
    for (var i = 0; i < this.popsize; i++) {
      var n = this.birds[i].fitness * 100;
      //nested for loop to have the fitness values stored in the matinpool to be pushed up into the birds array
      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.birds[i]);
      }
    }
  }
  
  //selection function. this function selects on the basis of the availability of the mating pool, which genes have higher 
  //fitness rate values, and selects them to produce a new bird when a new generation is spawned

  this.selection = function() {
    
    //initiating a new birds empty array
    var newBirds = [];
    
    //for loop to determine which parents' dna information is taken and randomly crossed over to create the genes array for
    //the progeny
    for (var i = 0; i < this.birds.length; i++) {
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      //crossover function crosses the genes from parent A with parent B by taking a random mid point in the genes array
      var child = parentA.crossover(parentB);
      //using the mutation function to introduce a 1% mutation rate, so that the progeny can have some of its own information
      //in the genes array
      child.mutation();
      newBirds[i] = new Bird(child);
    }
    this.birds = newBirds;
  }
  
  //run function updates and shows the bird population on the canvas

  this.run = function() {
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].update(); //calling the update fucntion from the Birds class that apply the forces on the birds which make
      //them move around the canvas
      this.birds[i].show(); //calling the show fucntion from the Birds class to populate the birds
    }
  }
}

//---DNA CLASS---
//this class takes the information stored in the genes array that
//acts as a DNA strand, and on that basis, helps perform crossover
//and mutation for the phenotypes to be produced

function DNA(genes) {
  if (genes) {
    this.genes = genes; 
  } else {
    this.genes = []; // setting up genes as an empty array
    
    //for loop that runs for the lifespan of the birds' population and creates a genes array with 2D vectors with a specfific 
    //magnitude
    for (var i = 0; i < lifespan; i++) {
      
      //initiating a new 2D random vector in the genes array
      this.genes[i] = p5.Vector.random2D();
      //setting the magnitude for the new vectors that were created in the genes array
      this.genes[i].setMag(maxforce);
    }
  }

//crossover function that details that what genes from which parent crosses over to produce a child. 
//the genes array is split from the mid point; which in turn is chosen randomly

  this.crossover = function(partner) {
    //setting up a variiable newgenes as an empty array
    var newgenes = [];
    //setting up a mid point in the genes' array length from where the genes can be picked up for the progeny
    var mid = floor(random(this.genes.length));
    
    //for loop to place the genes in either the current parent's genes array or in the partner B's genes array, on the basis of
    //the randomised mid point
    for (var i = 0; i < this.genes.length; i++) {
      if (i > mid) {
        newgenes[i] = this.genes[i];
      } else {
        newgenes[i] = partner.genes[i];
      }
    }
    //get the newgenes value after performing the crossover
    return new DNA(newgenes);
  }
  
  //mutation function. this function sets a 1% mutation rate for the genes to develop over time by taking 
  //genetic information from the parents' genes

  this.mutation = function() {
    for (var i = 0; i < this.genes.length; i++) {
      //if statement to get a 1% (0.01) rate for the genes and then store it in the genes array by creating a new 2D
      //vector and setting up a specific magnitude
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
  this.pos = createVector(width / 2, height); //vector for the position of the birds
  this.vel = createVector(); //vector for the velocity with which the birds will move
  this.acc = createVector(); //vector for the acceleration the birds will have
  this.reached = false; //boolean variable to determine whether the birds have reached the nest or not
  this.dead = false; //boolean value to determine whether the birds are alive or dead
  
  //If statement to determine there is dna information already available in the array, then keep it,
  //if not create a new instance of DNA

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
    
    //calculate the distance between the birds position and the nest's position
    var d = dist(this.pos.x, this.pos.y, nestTarget.x, nestTarget.y);

    //set fitness to it's reciprocal by mapping the values to it's invert value
    this.fitness = map(d, 0, width, width, 0);
    
    //if the bird reaches the nest, increase the fitness value by multiplying it to 10
    if (this.reached) {
      this.fitness *= 10;
    }
    
    //if the bird dies by colliding with the obstacle or the boundaries of the canvas, decrease the fitness value by
    //dividing it by 10
    if (this.dead) {
      this.fitness /= 10;
    }

  }

  this.update = function() {

//calculate the distance between the bird's position and the nest's position
    var d = dist(this.pos.x, this.pos.y, nestTarget.x, nestTarget.y);
    
  //placing IF statements for the birds to stop moving when they have reached the target
  
  //if the distance is less than 10 pixels, the bird has reached the nest, and copy the position of the bird in the
  //position of the bird
    if (d < 10) {
      this.reached = true;
      this.pos = nestTarget.copy();
    }
    
  //placing IF statements so that the birds do not go out of the canvas boundaries, if they hit the boundary, they die.

    if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
      this.dead = true;
    }


//if statement to check collision with the boundaries of the canvas
//if the bird reaches the width or the height, set the dead boolean variable to true
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
