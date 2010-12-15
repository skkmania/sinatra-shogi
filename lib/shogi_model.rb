# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  shogi_model.rb
#
class Board
  @@initial_board_string =
   'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL';
  def self.initial_board_string
    @@initial_board_string
  end

  def initialize
    @board = @@initial_board_string
    @black = ''
    @white = ''
    @turn  = true
  end
  attr_accessor :board, :black, :white, :turn

  def apply(move)
    @turn = !@turn
  end
end

