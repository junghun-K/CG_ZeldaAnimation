/* Lecture 13
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

export class MeshViewer extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private character: gfx.Transform3;
    private morphAlpha: number;

    constructor()
    {
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera);
        this.character = new gfx.Transform3();
        this.morphAlpha = 0;
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, .1, 20)
        this.cameraControls.setTargetPoint(new gfx.Vector3(0, 1, 0));
        this.cameraControls.setDistance(3);

        // Set a black background
        this.renderer.background.set(0, 0, 0);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.25, 0.25, 0.25));
        this.scene.add(ambientLight);

        // Create a directional light
        const pointLight = new gfx.PointLight(new gfx.Color(1.25, 1.25, 1.25));
        pointLight.position.set(2, 1, 3);
        this.scene.add(pointLight);

        // Create the ground
        const ground = gfx.MeshFactory.createBox(5, 1, 5);
        ground.material.setColor(new gfx.Color(0, 0.5, 0.5));
        ground.position.y = -0.5;
        this.scene.add(ground);

        // Add body
        this.character.add(this.loadMorphMesh(
          './assets/LinkBody1.obj',
          './assets/LinkBody2.obj',
          './assets/LinkBody.png'
        ));
        
        // Add Equipment
        this.character.add(this.loadMorphMesh(
          './assets/LinkEquipment1.obj',
          './assets/LinkEquipment2.obj',
          './assets/LinkEquipment.png'
        ));

        // Add eyes
        this.character.add(this.loadMorphMesh(
          './assets/LinkEyes1.obj',
          './assets/LinkEyes2.obj',
          './assets/LinkEyes.png'
        ));

        // Add Face
        this.character.add(this.loadMorphMesh(
          './assets/LinkFace1.obj',
          './assets/LinkFace2.obj',
          './assets/LinkSkin.png'
        ));

        // Add Hair
        this.character.add(this.loadMorphMesh(
          './assets/LinkHair1.obj',
          './assets/LinkHair2.obj',
          './assets/LinkBody.png'
        ));

        // Add Hands
        this.character.add(this.loadMorphMesh(
          './assets/LinkHands1.obj',
          './assets/LinkHands2.obj',
          './assets/LinkSkin.png'
        ));

        // Add Mouth
        this.character.add(this.loadMorphMesh(
          './assets/LinkMouth1.obj',
          './assets/LinkMouth2.obj',
          './assets/LinkBody.png'
        ));

        this.scene.add(this.character);  
        
        // Create a simple GUI
        const gui = new GUI();
        gui.width = 200;
        
          // Set slider at top
        const morphController = gui.add(this, 'morphAlpha', 0, 1);
        morphController.name('Alpha');
        morphController.onChange(() => {
          for(let i=0; i < this.character.children.length; i++) 
          {
            // Treat children array and treat that as MorphMesh
            const morphMesh = this.character.children[i] as gfx.MorphMesh;
            morphMesh.morphAlpha = this.morphAlpha;
          }
        });
    }

    // If we compute here, it would be very slow due to sending from GPU to CPU back and forth
    update(deltaTime: number): void 
    {
      
      // Linear interpolation
      const startPosition = new gfx.Vector3(0, 0, 0);
      const endPosition = new gfx.Vector3(0, 0.5, 1);
      this.character.position.lerp(startPosition, endPosition, this.morphAlpha);
      

      this.cameraControls.update(deltaTime);
    } 

    private loadMorphMesh(meshFile1: string, meshFile2: string, textureFile: string): gfx.MorphMesh 
    {
      const morphMesh = new gfx.MorphMesh();

      // When finished loading, do the following;
      // Load and copy buffer data from the first mesh into the morph buffers
      gfx.ObjLoader.load(meshFile1, (loadedMesh: gfx.Mesh)=>{
        morphMesh.positionBuffer = loadedMesh.positionBuffer;
        morphMesh.normalBuffer = loadedMesh.normalBuffer;
        morphMesh.texCoordBuffer = loadedMesh.texCoordBuffer;
        morphMesh.colorBuffer = loadedMesh.colorBuffer;
        morphMesh.indexBuffer = loadedMesh.indexBuffer;
        morphMesh.vertexCount = loadedMesh.vertexCount;
        morphMesh.triangleCount = loadedMesh.triangleCount;
      });

      // Load and copy buffer data from the second mesh into the morph buffers
      gfx.ObjLoader.load(meshFile2, (loadedMesh: gfx.Mesh)=>{
        morphMesh.morphTargetPositionBuffer = loadedMesh.positionBuffer;
        morphMesh.morphTargetNormalBuffer = loadedMesh.normalBuffer;
      });
      
      // Load the texture and assign it to the material
      morphMesh.material.texture = new gfx.Texture(textureFile);


      return morphMesh;
    }


}