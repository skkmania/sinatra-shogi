def create_query(meta_data, kifu_bytedata)
  query = 'delete from kifread;'
  query += 'delete from new_boards;'
  query += 'delete from new_moves;'
  query += bytes_to_query_text_type(kifu_bytedata, kifu_bytedata.length/2)
  query += "select kif_insert(null, '#{meta_data['g']}', '#{meta_data['b']}', '#{meta_data['w']}', '#{meta_data['r']}');"
  query += 'delete from kifread;'
end

