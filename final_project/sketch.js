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
var lifespan = 450;
var lifeP;
var count = 0;
var nestTarget;
var maxforce = 0.4;
var nest;
var birdie;
var dead;
var mySong;
var xA = 200;
var yA = 300;
var xB = 300;
var yB = 400;
var cloudSpeedA = 1;
var cloudSpeedB = 0.5;
var cloudSpeedC = 0.25;
var clouds = [];
var nyc;
var birdSong;

var rx = 350;
var ry = 200;
var rw = 300;
var rh = 20;

//preload function to load images into the sketch in async fashion
function preload() {
  nest = loadImage("assets/nest.png");
  birdie = loadImage("assets/bird.png");
  Song = loadSound("assets/wickedGames.mp3");
  nyc = loadImage("assets/nyc.png");
  birdSong = loadSound("assets/birdSong.mp3");
}

function setup() {
  createCanvas(1000, 600); //create canvas
  bird = new Bird();  //initializing the Bird function into an object
  population = new Population(); //initializing the Population function into an object
  lifeP = createP(); //creating a paragraph element
  //create a 2D vector, to initialize x and y values for the nest
  nestTarget = createVector(width/2, 50);
  
  //playing the background music using the .play(); parameter
  Song.play();
  //setting the volume of the background music to 80%
  Song.setVolume(0.6);
  
  //playing the birds chirping music in the background using .play();
  birdSong.play();
  //looping the music so that it runs till the time canvas is running
  birdSong.loop();
  //setting the volume of the bird music to 60%
  birdSong.setVolume(0.4);
  
  // Song.loop();
    // if (!Song.isPlaying()) {
    //   Song.Play();
    // }
    
//initializing the clouds array as a new Cloud object so that there are a total of 3 clouds stored in each new instance
  for (var i = 0; i < 3; i++) {
      clouds[i] = new Cloud();
    }
}

function draw() {
  //set background color
  background(109, 138, 255);
  //initialize the population of birds by calling the run function in the population constructor function
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
  
  //for loop to display new clouds from either of the 2 different patterns with random positions for each new cloud
  for (var i = 0; i < 3; i++) {
  clouds[i].patternA(); //calling the patternA function in the Cloud function
  clouds[i].patternB(); //calling the patternB function in the Cloud function
  }
  
  // using push-pop block to keep the code local to specific commands
  push();
  //fill brown color in the rectangle
  fill(102, 65, 5);
  //create rectangle
  rect(rx, ry, rw, rh);
  //initializing the nest where the birds have to reach; the target!
  //set image's pivot point to the center
  imageMode(CENTER);
  //call in the nest image. Since we declared the nest's position as a vector, we can have it's position called individually
  //in terms of x (nestTarget.x) and y (nestTarget.y)
  image(nest, nestTarget.x, nestTarget.y, 50, 25);
  pop();
  
  // loading the nyc skyline image into the canvas
  image(nyc, 0, 425, 1000, 175);
  
}

//---POPULATION CONSTRUCTOR FUNCTION---
//this function creates the population of birds after each population's lifespan
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
    // tint(random(255));
    this.birds[i] = new Bird(); //initializing the birds array as an object of the Bird constructor function
  }

//evaluate function. this function evaluates the fitness value of each phenotype and places them in a mating pool.
//higher the fitness rate, higher the chances of that bird to make it to the nest.

  this.evaluate = function() {
    
//set initial value for the maximum fitness a progeny can achieve
    var maxfit = 0;
    //for loop to calculate the fitness values of the progeny
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].calcFitness();
      //the if statement stores the fitness value for each bird in the array as the new maximum fitness value, if the
      //birds array's fitness value goes more than the value of maximum fitness variable, we reset it to the maxfit value
      if (this.birds[i].fitness > maxfit) {
        maxfit = this.birds[i].fitness;
      }
    }
    //for loop that divides the fitness value of each bird in the array by the maxfit value so that we can normalise the maximum
    //fitness values. For ex: the maximum fitness achieved is 1000, we can have it divided by 1000 to get a normalised value of 1.
    for (var i = 0; i < this.popsize; i++) {
      this.birds[i].fitness /= maxfit;
    }
  //for loop to multiply the fitness value by 100 to make the normalised value that is between 0 and 1, to make it between
  //0 and 100. so therefore making the value occurring more number of times in the amting pool, easier to be picked up by the
  //progeny
    this.matingpool = [];
    for (var i = 0; i < this.popsize; i++) {
      var n = this.birds[i].fitness * 100;
      //nested for loop to have the fitness values stored in the matinpool to be pushed up into the birds array
      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.birds[i]);
      }
    }
  }
  
  //selection function. this function selects on the basis of the availability of the mating pool from 2 parents, which
  //genes have higher fitness values, and selects them to produce a new bird when a new generation is spawned

  this.selection = function() {
    
    //initiating a new birds empty array
    var newBirds = [];
    
    //for loop to determine which parents' dna information is taken and randomly crossed over to create the genes array for
    //the progeny
    for (var i = 0; i < this.birds.length; i++) {
      var parentA = random(this.matingpool).dna; //picking up a random index from the mating pool of parent A
      var parentB = random(this.matingpool).dna; //picking up a random index from the mating pool of parent A
      //crossover function crosses the genes from parent A with parent B by taking a random mid point in the genes array
      var child = parentA.crossover(parentB);
      //using the mutation function to introduce a 1% mutation rate, so that the progeny can have some of its own information
      //in the genes array
      child.mutation();
      newBirds[i] = new Bird(child);
    }
    //after the crossover and mutation of the progeny is done, we create new birds from those genes' information and store them
    //in the birds array; basically making new generations of birds everytime.
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

//---DNA CONSTRUCTOR FUNCTION---
//this function takes the information stored in the genes array that
//acts as a DNA strand, and on that basis, helps perform crossover
//and mutation for the phenotypes to be produced

function DNA(genes) {
  
  //if the genes information already exists, keep it else create a new genes array which is empty
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
//the genes array is split from the mid point; which in turn is chosen randomly. So, crossover being a dna object takes the 
//dna genes from before the mid point from itself, and takes the genes from after the mide point from the partner, and crosses
//over both the genes' sets to create a new genes array

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
      //vector and setting up a specific magnitude. we set this value by taking each frame rate and giving it a 1% chance
      //if it that condition exists, we create a new random 2D vector with it's magnitude set as maxforce
      if (random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }

}

//---BIRD CONSTRUCTOR FUNCTION---
//this function is responsible for spawning new generations of birds
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


  //force = mass * acceleration. for the sake of simplicity, we are ruling out mass from the equation
  //this makes force = acceleration. we make a new function called applyForce that takes the parameter as force, which is basically
  //set as acceleration that comes from the basic physics engine we made
  this.applyForce = function(force) {
    this.acc.add(force);
  }

//calculating fitness. if the bird reaches the nest, increase the fitness value, if the bird dies elsewhere
//decrease the fitness value.

  this.calcFitness = function() {
    
    //calculate the distance between the birds position and the nest's position. since the bird has it x and y values, and the nest
    //has it's own x and y values, we measure the distance between those 2 points and store it in a variable called d
    var d = dist(this.pos.x, this.pos.y, nestTarget.x, nestTarget.y);

    //set fitness to it's reciprocal by mapping the values to it's invert value, or in simpler terms fitness = 1/d
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
    
  //placing IF statements so if the birds collide with the obstacle, they die.
  //here, we compare the birds x and y position values with the height and width of the obstacle.
  //if any of those values are greater than the birds position, the bird is colliding with the obstacle and therefore
  //the this.dead variable value is set to true
    if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
      this.dead = true;
      // if (this.dead) {
      //   this.birds = null;
      // }
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
    
    // if (this.dead == false) {
    push();
      noStroke();
      fill(255, 150);
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading()); //rotate the vector of the bird object towards the direction of the velocity so that the bird
                                  //is always facing forward, or facing towards the disrection it is flying in
      imageMode(CENTER); //set the image mode to center
        push();
          rotate(20);
          image(birdie, 0, 0, 30, 15);
        pop();
    pop();
    // } else {
    //   //play dying animation
    //   for (var i = 0; i =< 360; i+= 20) {
    //     ellipse(this.pos.x + sin(radians(i)), this.pos.y + cos(radians(i)), 10, 10);
        
    //   }
    // }
  }
}

//---CLOUD CONSTRUCTOR FUNCTION---
//this function is responsible for spawning new clouds in 2 patterns, viz., pattern A and pattern B.
//the function sets random values on the y axis for the clouds to spawn on and gives them a speed to move
//across the x axis.

function Cloud() {
  
  //private variables
  this.x = random(0, width);
  this.y = random(100, 400);
  this.p = random(0, width);
  this.q = random(200, 500);
  this.cloudSpeed = 0.5;
  
  //creating a function for pattern A
  this.patternA = function() {
  
  //using a number of ellipses to align them in a shape of a cloud and setting different alpha values
  //* used the same technique for pattern B as well
  
    noStroke();
    fill(255, 120);
    ellipse(this.x, this.y, 50, 50);
    fill(255, 70);
    ellipse(this.x-15, this.y+5, 40, 40);
    fill(255, 80);
    ellipse(this.x+20, this.y+8, 35, 35);
    fill(255, 50);
    ellipse(this.x+35, this.y+12, 25, 25);
    
    //setting the speed with which the cloud will move across the canvas
    
    this.x += this.cloudSpeed;
    
    //setting up an IF statement that checks if the cloud is going outside the boundary of the canvas
    //and if it does, we resset the value of it's x component to 0, so that the cloud comes back around on the canvas
    
    if (this.x > width) {
      this.x = 0;
    }
  
  }
  
  this.patternB = function() {
  
  //refer *
  
    noStroke();
    fill(255, 85);
    ellipse(this.p, this.q+15, 45, 45);
    fill(255, 40);
    ellipse(this.p-20, this.q+25, 30, 30);
    fill(255, 75);
    ellipse(this.p+20, this.q+10, 55, 55);
    fill(255, 90);
    ellipse(this.p+40, this.q+25, 25, 25);
    
    //setting up the speed of the cloud, but this time in the opposite direction
    
    this.p -= this.cloudSpeed;
      
    if (this.p < 0) {
      this.p = width;
    }
  }
}
