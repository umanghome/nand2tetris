// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.

  @8192
  D=A
  @screencount
  M=D // screencount = 8152 (32 x 256)

  @color
  M=0 // set color to white

(CHECK)
  @SCREEN
  D=A
  @address
  M=D-1 // Set starting address for paint to SCREEN-1

  @i
  M=0 // i = 0

  @KBD
  D=M // D=KBD, then jump accordingly
  @TURNWHITE
  D;JEQ
  @TURNBLACK
  D;JMP

(TURNWHITE)
  @color
  M=0 // set color=0 and jump to paint
  @PAINT
  D;JMP

(TURNBLACK)
  @color
  M=-1 // set color=1 and jump to paint
  @PAINT
  D;JMP

(PAINT)
  @i
  D=M
  @screencount
  D=D-M
  @ENDPAINTLOOP
  D;JEQ // verify if i < screencount, end loop if false
  
  @address
  M=M+1 // increment address to paint

  @color
  D=M
  @address
  A=M
  M=D // RAM[address]=color

  @i
  M=M+1 // i++

  @PAINT
  D;JMP // restart loop

(ENDPAINTLOOP)
  @CHECK
  D;JMP // check for key now