# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  shogi_model.rb
#
require 'lib/store.rb'
class Board
  @@initial_board_string =
   'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL';
  def self.initial_board_string
    @@initial_board_string
  end

  def initialize
    @store  = Store.new
    @bid   = 1
    @board = @@initial_board_string
    @black = ''
    @white = ''
    @turn  = true
  end
  attr_accessor :store, :board, :black, :white, :turn

  #
  #  apply(line)
  #  lineで表現された指し手を現在のboardに適用する
  #  @storeからとれる情報をとり、自らの情報を追加しHashを組み立て返す
  #  入力: line 文字列 CSA形式の指し手文字列 例：+7776FU
  #  出力: delta Wave::StateにsubmitできるHash
  def apply(line)
    ret = {}
    @turn = !@turn
    ret['turn'] = (@turn ? 't' : 'f')
    move = Move.new.parse_csa(self, line)
    ret.merge! @store.get_section @bid, move
    ret
  end

  #
  #  get_piece(index)
  #    盤上の駒の文字を取得する
  #    入力: 2桁の数字 7六 -> 76
  #    出力: 文字
  #
  def get_piece(index)
    x, y = index.divmod 10
    self.board[(x-1)*9 + y - 1].chr
  end
end


  #  Moveオブジェクト DB上のmoveの形式
  #          例： +7776FU  ->  [:bid => 適用する前のbid,
  #                             :m_from => 77,
  #                             :m_to   => 76,
  #                             :piece  => 'P',
  #                             :promote => false,
  #                             :nxt_bid =>  適用した後のbid]
class Move < Hash
  @@pieces = {'FU' => 'p', 'KY' => 'l', 'KE' => 'n', 'GI' => 's',
              'KI' => 'g', 'OU' => 'k', 'HI' => 'r', 'KA' => 'b',
              'TO' => 'q', 'NY' => 'm', 'NK' => 'o', 'NG' => 't',
              'UM' => 'h', 'RY' => 'd'}
  def self.pieces
    @@pieces
  end
  #
  #  parse_csa
  #    CSA形式の指し手文字列を読み自身にとりこむ
  #    入力: board Boardオブジェクト
  #        : line 文字列 CSA形式の指し手文字列 例：+7776FU
  #        この文字列に改行がついていたら取りさって評価する
  #    出力: なし
  #          例： +7776FU  ->  [77, 76, P, false]
  #  注意：このメソッドにはこの手を指した盤面が必要
  #  その理由：DB上のmove形式とcsa形式の定義の違い
  #    成り駒の扱い：DBでは成る前の状態の駒の名前を保持
  #                  CSAでは成った後の駒の名前を表示
  #    CSAでは盤面がないと、その手が成りかどうかわからないのに
  #    DBではその手だけでわかることを要求している
  #
  def parse_csa(board, line)
    line.chomp!
    self[:turn]   = (line[0] == '+'[0])
    self[:m_from] = line[1,2].to_i
    self[:m_to]   = line[3,4].to_i
    self[:piece]  = board.get_piece(self[:m_from])
    self[:promote] = false
    if  'qmothd'.index(@@pieces[ line[5,6] ]) and # 動かした駒が成り駒,かつ
        'plnsbr'.index(self[:piece].downcase) then
                                    # 動かす前が成り駒でないとき
      self[:promote] = true  
    end
  end
end
