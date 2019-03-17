// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.
  @i
  M=1 // i = 1

  @mult
  M=0 // mult = 0

(LOOP)
  @i
  D=M

  @R1
  D=D-M
  @ENDLOOP
  D-1;JEQ // i < R1

  @i
  M=M+1 // i++

  @mult
  D=M
  @R0
  D=D+M
  @mult
  M=D // mult = mult + R1

  @LOOP
  D;JMP

(ENDLOOP)
  @mult
  D=M
  @R2
  M=D // R2 = mult

(END)
  @END
  D;JMP